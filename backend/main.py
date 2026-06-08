from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import auth
from database import engine, get_db
import os
import uuid
import shutil
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
}

# Create SQLite tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mujer eres Libre API",
    description="Backend API con SQLite para administración de contenidos y voluntarios",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Restringir CORS según variable de entorno
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files at /uploads/
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# Startup Seeding
@app.on_event("startup")
def seed_database():
    db = next(get_db())
    try:
        # Create default admin user if not exists
        default_email = "admin@mujerereslibre.org"
        admin = db.query(models.User).filter(models.User.email == default_email).first()
        if not admin:
            initial_password = os.environ.get("INITIAL_ADMIN_PASSWORD", "admin123")
            hashed_pw = auth.get_password_hash(initial_password)
            db.add(models.User(email=default_email, hashed_password=hashed_pw))
            db.commit()

        # Seed metrics if empty
        if db.query(models.Metric).count() == 0:
            default_metrics = [
                models.Metric(
                    value="+5k",
                    label="Mujeres Apoyadas",
                    description="Han recuperado su dignidad y autonomía a través de nuestros programas integrales."
                ),
                models.Metric(
                    value="+10k",
                    label="Familias Impactadas",
                    description="Generando un cambio social desde el núcleo de la sociedad hacia la comunidad."
                ),
                models.Metric(
                    value="05",
                    label="Áreas de Servicio",
                    description="Acompañamiento en salud, educación, vivienda, cultura y obras sociales."
                ),
            ]
            db.bulk_save_objects(default_metrics)
            db.commit()

        # Seed services if empty
        if db.query(models.ServiceCard).count() == 0:
            default_services = [
                models.ServiceCard(
                    title="Educación y Capacitación",
                    number="01",
                    description="Creación de centros educativos (desde educación formal e informal hasta educación superior). Realización de seminarios, talleres y capacitación en seguridad social. Gestión de becas para estudios universitarios.",
                    image_url="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2000&auto=format&fit=crop",
                    is_full_width=True
                ),
                models.ServiceCard(
                    title="Salud y Asistencia Social",
                    number="02",
                    description="Prestación de servicios de salud mediante profesionales adscritos. Establecimiento de centros de asistencia médica y de conciliación gratuita.",
                    image_url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop",
                    is_full_width=False
                ),
                models.ServiceCard(
                    title="Desarrollo y Vivienda",
                    number="03",
                    description="Gestión y ejecución de proyectos de vivienda de interés social. Proyectos para la generación de empleo en pequeñas y medianas empresas.",
                    image_url="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop",
                    is_full_width=False
                ),
                models.ServiceCard(
                    title="Comunicación y Cultura",
                    number="04",
                    description="Creación de medios de comunicación con fundamento educativo. Promoción de actividades recreativas y culturales.",
                    image_url="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop",
                    is_full_width=False
                ),
                models.ServiceCard(
                    title="Contratos y Convenios",
                    number="05",
                    description="Celebración de contratos de obras civiles y administración de educación pública con entes nacionales e internacionales.",
                    image_url="https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=2000&auto=format&fit=crop",
                    is_full_width=False
                ),
            ]
            db.bulk_save_objects(default_services)
            db.commit()

        # Seed contents if empty
        if db.query(models.ContentItem).count() == 0:
            default_contents = [
                models.ContentItem(key="brand.initials", value="MEL"),
                models.ContentItem(key="brand.name", value="Mujer eres libre"),
                models.ContentItem(key="brand.logo_url", value=""),
                models.ContentItem(key="hero.tagline", value="Fundación Mujer eres Libre"),
                models.ContentItem(key="hero.title", value="Mujer, eres libre. Ayúdanos a enderezar el camino de miles de familias."),
                models.ContentItem(key="hero.description", value="Nuestra misión es brindar esperanza, restaurar la dignidad y trabajar con total transparencia para que cada ser humano pueda levantarse con autonomía."),
                models.ContentItem(key="hero.btn_primary", value="Dona Ahora y Transforma una Vida"),
                models.ContentItem(key="hero.btn_secondary", value="Únete como Voluntario"),
                models.ContentItem(key="about.section_title", value="Un mandato de compasión y libertad para quienes más lo necesitan."),
                models.ContentItem(key="about.history_lead", value="La historia de nuestra fundación no comienza en una oficina, ni en un escritorio; nace en la quietud de un encuentro sagrado. Fruto de un ayuno de tres días de búsqueda espiritual, el propósito de esta obra fue revelado no como un proyecto humano, sino como un mandato de compasión y libertad."),
                models.ContentItem(key="about.history_p1", value="Durante aquel tiempo de silencio y oración, el corazón recibió un mensaje a través del Evangelio de Lucas 13:11. La Escritura describe a una mujer que, durante dieciocho largos años, vivió encorvada por un espíritu de enfermedad que le impedía levantar la mirada al cielo. Su realidad era el peso agobiante de la opresión, el dolor físico y el cansancio del alma."),
                models.ContentItem(key="about.history_p2", value="Sin embargo, el relato cobra una fuerza transformadora cuando el Maestro, al verla, no pasa de largo. Él la llama y pronuncia las palabras que hoy dan nombre y vida a nuestra institución: “Mujer, eres libre”. En ese instante, lo que estaba encorvado se enderezó y lo que estaba cautivo recuperó su dignidad."),
                models.ContentItem(key="about.history_p3", value="Esa revelación fue el espejo donde vimos reflejada la realidad de miles de mujeres en nuestro tiempo. Comprendimos que, al igual que aquella mujer de la sinagoga, muchas hoy caminan por la vida \"encorvadas\" bajo el peso de las carencias, la violencia, la frustración y el olvido. Viven atadas a circunstancias que les impiden reconocer su propio valor y potencial."),
                models.ContentItem(key="about.history_p4", value="Nuestra esencia es entrar en el escenario de la dificultad para ofrecer una mano extendida. Queremos ser el instrumento que ayude a cada mujer, a cada niño y a cada familia a soltar las cargas que les oprimen, permitiéndoles sanar el dolor y transformar la tristeza en un propósito de vida."),
                models.ContentItem(key="about.image_main", value="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop"),
                models.ContentItem(key="about.image_floating", value="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop"),
                models.ContentItem(key="about.mission_title", value="Transformar la vida de quienes caminan bajo el peso de la vulnerabilidad."),
                models.ContentItem(key="about.mission_body", value="La Fundación Mujer eres Libre se ha creado para transformar la vida de mujeres, niños y familias que caminan bajo el peso de la vulnerabilidad y la opresión. Nuestra misión es brindar un acompañamiento integral en salud, educación y desarrollo social, permitiendo que cada ser humano sane su pasado, recupere su dignidad y se levante con autonomía hacia un futuro lleno de esperanza."),
                models.ContentItem(key="about.vision_title", value="Un futuro donde nadie viva con el alma encorvada por las carencias."),
                models.ContentItem(key="about.vision_body", value="Proyectamos un futuro donde ninguna mujer tenga que vivir con el alma encorvada por las carencias o la tristeza. La Fundación Mujer eres Libre se visualiza como el motor de cambio que habrá ayudado a miles de familias a enderezar su camino y levantar la mirada hacia nuevas oportunidades. Seremos una institución que, a través de la educación y el servicio integral, habrá sembrado libertad y justicia social en cada territorio donde nuestra voz sea escuchada."),
                models.ContentItem(key="about.quote_text", value="Llegué encorvada por la tristeza y las dificultades. Hoy puedo levantar la mirada con esperanza; encontré una familia que me ayudó a enderezar mi camino."),
                models.ContentItem(key="about.quote_name", value="María C."),
                models.ContentItem(key="about.quote_role", value="Beneficiaria del programa"),
                models.ContentItem(key="about.quote_image", value="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop"),
                models.ContentItem(key="footer.cta_title", value="Sé parte del cambio."),
                models.ContentItem(key="footer.email", value="contacto@mujerereslibre.org"),
                models.ContentItem(key="footer.address", value="Calle 8 Carrera 4# 3-79"),
                models.ContentItem(key="footer.phone1", value="3006255869"),
                models.ContentItem(key="footer.phone2", value="3003036068"),
                models.ContentItem(key="footer.url_facebook", value="#"),
                models.ContentItem(key="footer.url_instagram", value="#"),
                models.ContentItem(key="footer.url_twitter", value="#"),
                models.ContentItem(key="footer.brand_description", value="Un mandato de compasión y libertad. Ayudando a mujeres, niños y familias a sanar su dolor y caminar en la plenitud de su libertad."),
                models.ContentItem(key="volunteer.title", value="Únete como Voluntario"),
                models.ContentItem(key="volunteer.description", value="Forma parte del cambio. Comparte tu tiempo y talento en nuestras áreas de servicio para transformar vidas."),
                models.ContentItem(key="volunteer.areas", value="Educación y Capacitación,Salud y Asistencia Social,Desarrollo y Vivienda,Comunicación y Cultura,Obras Sociales"),
            ]
            db.bulk_save_objects(default_contents)
            db.commit()

        # Seed gallery if empty
        if db.query(models.GalleryAlbum).count() == 0:
            default_albums = [
                models.GalleryAlbum(
                    title="Entrega de Kits Escolares 2025",
                    date="Enero 2025",
                    coverImage="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
                    photos=[
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop")
                    ]
                ),
                models.GalleryAlbum(
                    title="Jornada de Salud Comunitaria",
                    date="Noviembre 2024",
                    coverImage="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
                    photos=[
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop")
                    ]
                ),
                models.GalleryAlbum(
                    title="Taller de Emprendimiento Femenino",
                    date="Septiembre 2024",
                    coverImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
                    photos=[
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"),
                        models.GalleryPhoto(url="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop")
                    ]
                )
            ]
            db.add_all(default_albums)
            db.commit()

        # Seed news if empty
        if db.query(models.NewsCategory).count() == 0:
            default_categories = [
                models.NewsCategory(
                    name="Historias de Impacto",
                    description="Testimonios reales de vidas transformadas gracias a los programas de la fundación.",
                    coverImage="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop",
                    articles=[
                        models.NewsArticle(
                            title="De la adversidad al emprendimiento: La historia de Ana",
                            excerpt="Cómo una madre soltera logró levantar su propio negocio tras recibir capacitación y apoyo psicológico.",
                            date="15 Febrero 2025",
                            imageUrl="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop",
                            content="La historia de Ana es un testimonio vivo del poder de la resiliencia. Hace apenas un año, Ana llegó a nuestra fundación buscando una luz de esperanza para ella y sus dos hijos. Sin empleo formal y enfrentando dificultades económicas severas, su futuro parecía incierto.\n\nTras ingresar a nuestro programa de capacitación integral, Ana no solo adquirió habilidades técnicas en confección, sino que también recibió acompañamiento psicológico que le permitió reconstruir su autoestima. Hoy, es dueña de su propio taller, generando empleo para otras dos mujeres de su comunidad.\n\n'La fundación no solo me dio herramientas para trabajar, me devolvió la dignidad y las ganas de soñar', comparte Ana con una sonrisa. Su historia nos recuerda por qué trabajamos cada día."
                        ),
                        models.NewsArticle(
                            title="Una nueva oportunidad para sonreír",
                            excerpt="El impacto de nuestras jornadas de salud en la recuperación emocional de niños en estado de vulnerabilidad.",
                            date="28 Enero 2025",
                            imageUrl="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop",
                            content="Nuestra última brigada de salud rural no solo se enfocó en atenciones médicas básicas. Por primera vez, integramos un equipo de voluntarios especializados en odontología pediátrica y recreación terapéutica.\n\nDurante tres días, más de 150 niños recibieron atención especializada. Pero más allá de los tratamientos, el verdadero impacto se vio en las actividades lúdicas que acompañaron las jornadas. A través del juego y el arte, logramos crear un espacio seguro donde los más pequeños pudieron expresar sus emociones y recibir contención.\n\nEste modelo de atención integral será replicado en nuestras próximas cinco brigadas a nivel nacional."
                        )
                    ]
                ),
                models.NewsCategory(
                    name="Comunicados Oficiales",
                    description="Anuncios, reportes de transparencia y alianzas estratégicas institucionales.",
                    coverImage="https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=800&auto=format&fit=crop",
                    articles=[
                        models.NewsArticle(
                            title="Firma de nuevo convenio con el Ministerio de Educación",
                            excerpt="Un paso histórico que permitirá expandir la cobertura de nuestras becas universitarias en un 40%.",
                            date="10 Marzo 2025",
                            imageUrl="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
                            content="Con profundo orgullo anunciamos la firma oficial del nuevo acuerdo marco con el Ministerio de Educación Nacional. Esta alianza estratégica representa uno de los hitos más importantes en la historia de nuestra institución.\n\nEl convenio garantizará un fondo conjunto que permitirá incrementar en un 40% el número de becas completas otorgadas a jóvenes de excelencia académica en situación de vulnerabilidad. Además, incluye un componente de acompañamiento para asegurar su permanencia y éxito académico.\n\nAgradecemos a todas las entidades gubernamentales y donantes privados que hicieron esto posible. Seguimos construyendo futuro a través de la educación."
                        ),
                        models.NewsArticle(
                            title="Reporte de Transparencia Anual 2024",
                            excerpt="Conoce en detalle cómo fueron invertidos los fondos recaudados durante el último año.",
                            date="05 Enero 2025",
                            imageUrl="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
                            content="La confianza de nuestros donantes y aliados es el pilar fundamental que sostiene nuestra labor. Fieles a nuestro compromiso de total transparencia, presentamos el reporte de gestión y financiero correspondiente a la vigencia 2024.\n\nDurante este período, el 85% de los recursos recaudados fue destinado directamente a la ejecución de programas en territorio, impactando a más de 5,000 familias. El porcentaje restante aseguró la sostenibilidad administrativa y operativa de la fundación.\n\nEl informe detallado está disponible para consulta pública en nuestras oficinas y ha sido auditado por firmas independientes de primer nivel."
                        )
                    ]
                ),
                models.NewsCategory(
                    name="Eventos y Convocatorias",
                    description="Información sobre próximas campañas, voluntariados y eventos de recaudación.",
                    coverImage="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop",
                    articles=[
                        models.NewsArticle(
                            title="Convocatoria Abierta: Voluntarios para Campaña de Salud",
                            excerpt="Buscamos profesionales médicos y estudiantes para nuestra próxima brigada de salud rural.",
                            date="20 Marzo 2025",
                            imageUrl="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop",
                            content="Hacemos un llamado urgente a la solidaridad y el servicio. La Fundación abre oficialmente las inscripciones para la Gran Brigada de Salud Rural que se llevará a cabo en el segundo semestre del año.\n\nBuscamos médicos generales, especialistas, odontólogos, psicólogos y estudiantes de últimos semestres de áreas de la salud. Así mismo, requerimos apoyo logístico y voluntarios generales para el desarrollo de la jornada.\n\nSi sientes el llamado a servir y transformar realidades, postúlate a través de nuestro portal de voluntarios. Tu tiempo y conocimiento pueden ser la respuesta a las oraciones de toda una comunidad."
                        )
                    ]
                )
            ]
            db.add_all(default_categories)
            db.commit()
    finally:
        db.close()

# Authentication Endpoint
@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos.",
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Metrics Endpoints
@app.get("/api/metrics", response_model=List[schemas.MetricResponse])
def read_metrics(db: Session = Depends(get_db)):
    return db.query(models.Metric).all()

@app.put("/api/metrics", response_model=List[schemas.MetricResponse])
def update_metrics(
    updated_metrics: List[schemas.MetricResponse],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    for metric_in in updated_metrics:
        db_metric = db.query(models.Metric).filter(models.Metric.id == metric_in.id).first()
        if db_metric:
            db_metric.value = metric_in.value
            db_metric.label = metric_in.label
            db_metric.description = metric_in.description
    db.commit()
    return db.query(models.Metric).all()

# Service Card Endpoints (CRUD)
@app.get("/api/services", response_model=List[schemas.ServiceCardResponse])
def read_services(db: Session = Depends(get_db)):
    return db.query(models.ServiceCard).order_by(models.ServiceCard.number).all()

@app.post("/api/services", response_model=schemas.ServiceCardResponse)
def create_service(
    service: schemas.ServiceCardCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_service = models.ServiceCard(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@app.put("/api/services/{service_id}", response_model=schemas.ServiceCardResponse)
def update_service(
    service_id: int,
    service: schemas.ServiceCardUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_service = db.query(models.ServiceCard).filter(models.ServiceCard.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    
    for key, value in service.dict().items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@app.delete("/api/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_service = db.query(models.ServiceCard).filter(models.ServiceCard.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    db.delete(db_service)
    db.commit()
    return {"message": "Servicio eliminado con éxito."}

# Volunteer Endpoints
@app.post("/api/volunteers", response_model=schemas.VolunteerResponse)
def create_volunteer(volunteer: schemas.VolunteerCreate, db: Session = Depends(get_db)):
    db_volunteer = models.Volunteer(**volunteer.dict())
    db.add(db_volunteer)
    db.commit()
    db.refresh(db_volunteer)
    return db_volunteer

@app.get("/api/volunteers", response_model=List[schemas.VolunteerResponse])
def get_volunteers(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Volunteer).order_by(models.Volunteer.created_at.desc()).all()

@app.delete("/api/volunteers/{volunteer_id}")
def delete_volunteer(volunteer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_volunteer = db.query(models.Volunteer).filter(models.Volunteer.id == volunteer_id).first()
    if not db_volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    db.delete(db_volunteer)
    db.commit()
    return {"message": "Volunteer deleted"}

# Content Endpoints
@app.get("/api/content")
def get_content(db: Session = Depends(get_db)):
    items = db.query(models.ContentItem).all()
    return {item.key: item.value for item in items}

@app.put("/api/content")
def update_content(
    content_update: schemas.ContentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    for key, value in content_update.updates.items():
        db_item = db.query(models.ContentItem).filter(models.ContentItem.key == key).first()
        if value is None:
            if db_item:
                db.delete(db_item)
        else:
            if db_item:
                db_item.value = value
            else:
                db_item = models.ContentItem(key=key, value=value)
                db.add(db_item)
    db.commit()
    
    # Return updated content
    items = db.query(models.ContentItem).all()
    return {item.key: item.value for item in items}

# Image Upload Endpoint
@app.post("/api/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".bmp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Solo imágenes."
        )

    imgbb_api_key = os.environ.get("IMGBB_API_KEY")

    if imgbb_api_key:
        # Subir a ImgBB en la nube
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        
        response = requests.post(
            "https://api.imgbb.com/1/upload",
            data={
                "key": imgbb_api_key,
                "image": encoded_image,
                "name": os.path.splitext(file.filename)[0]
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return {"url": data["data"]["url"]}
        else:
            raise HTTPException(status_code=500, detail="Error uploading image to ImgBB")
    else:
        # Fallback a almacenamiento local (se borra en Render)
        filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/uploads/{filename}"}


# Gallery Endpoints
@app.get("/api/gallery", response_model=List[schemas.AlbumResponse])
def get_gallery(db: Session = Depends(get_db)):
    return db.query(models.GalleryAlbum).all()

@app.post("/api/gallery", response_model=schemas.AlbumResponse)
def create_album(album: schemas.AlbumCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_album = models.GalleryAlbum(**album.model_dump())
    db.add(db_album)
    db.commit()
    db.refresh(db_album)
    
    if db_album.linked_article_id:
        linked_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == db_album.linked_article_id).first()
        if linked_article:
            linked_article.linked_album_id = db_album.id
            db.commit()
            
    return db_album

@app.put("/api/gallery/{album_id}", response_model=schemas.AlbumResponse)
def update_album(album_id: int, album: schemas.AlbumCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id == album_id).first()
    if not db_album:
        raise HTTPException(status_code=404, detail="Album not found")
        
    old_linked_article_id = db_album.linked_article_id
        
    for key, value in album.model_dump().items():
        setattr(db_album, key, value)
    db.commit()
    db.refresh(db_album)
    
    if old_linked_article_id != db_album.linked_article_id:
        if old_linked_article_id:
            old_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == old_linked_article_id).first()
            if old_article and old_article.linked_album_id == db_album.id:
                old_article.linked_album_id = None
        if db_album.linked_article_id:
            new_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == db_album.linked_article_id).first()
            if new_article:
                new_article.linked_album_id = db_album.id
        db.commit()
        
    return db_album

@app.delete("/api/gallery/{album_id}")
def delete_album(album_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id == album_id).first()
    if not db_album:
        raise HTTPException(status_code=404, detail="Album not found")
    db.delete(db_album)
    db.commit()
    return {"message": "Album deleted"}

@app.post("/api/gallery/{album_id}/photos", response_model=schemas.PhotoResponse)
def add_photo_to_album(album_id: int, photo: schemas.PhotoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_photo = models.GalleryPhoto(**photo.model_dump(), album_id=album_id)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@app.delete("/api/gallery/photos/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_photo = db.query(models.GalleryPhoto).filter(models.GalleryPhoto.id == photo_id).first()
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    db.delete(db_photo)
    db.commit()
    return {"message": "Photo deleted"}

# News Endpoints
@app.get("/api/news", response_model=List[schemas.CategoryResponse])
def get_news(db: Session = Depends(get_db)):
    return db.query(models.NewsCategory).all()

@app.post("/api/news", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_category = models.NewsCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.put("/api/news/{category_id}", response_model=schemas.CategoryResponse)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_category = db.query(models.NewsCategory).filter(models.NewsCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category.model_dump().items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/api/news/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_category = db.query(models.NewsCategory).filter(models.NewsCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}

@app.post("/api/news/{category_id}/articles", response_model=schemas.ArticleResponse)
def create_article(category_id: int, article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_article = models.NewsArticle(**article.model_dump(), category_id=category_id)
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    if db_article.linked_album_id:
        linked_album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id == db_article.linked_album_id).first()
        if linked_album:
            linked_album.linked_article_id = db_article.id
            db.commit()
            
    return db_article

@app.put("/api/news/articles/{article_id}", response_model=schemas.ArticleResponse)
def update_article(article_id: int, article: schemas.ArticleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    old_linked_album_id = db_article.linked_album_id
        
    for key, value in article.model_dump().items():
        setattr(db_article, key, value)
    db.commit()
    db.refresh(db_article)
    
    if old_linked_album_id != db_article.linked_album_id:
        if old_linked_album_id:
            old_album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id == old_linked_album_id).first()
            if old_album and old_album.linked_article_id == db_article.id:
                old_album.linked_article_id = None
        if db_article.linked_album_id:
            new_album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id == db_article.linked_album_id).first()
            if new_album:
                new_album.linked_article_id = db_article.id
        db.commit()
        
    return db_article

@app.delete("/api/news/articles/{article_id}")
def delete_article(article_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(db_article)
    db.commit()
    return {"message": "Article deleted"}

@app.post("/api/news/articles/{article_id}/comments", response_model=schemas.NewsCommentResponse)
def create_comment(article_id: int, comment: schemas.NewsCommentCreate, db: Session = Depends(get_db)):
    db_article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    db_comment = models.NewsComment(
        article_id=article_id,
        name=comment.name,
        text=comment.text,
        date=comment.date
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@app.get("/api/forms", response_model=List[schemas.CustomFormResponse])
def get_forms(db: Session = Depends(get_db)):
    return db.query(models.CustomForm).all()

@app.get("/api/forms/{form_id}", response_model=schemas.CustomFormResponse)
def get_form(form_id: int, db: Session = Depends(get_db)):
    db_form = db.query(models.CustomForm).filter(models.CustomForm.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@app.post("/api/forms", response_model=schemas.CustomFormResponse)
def create_form(form: schemas.CustomFormCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_form = models.CustomForm(title=form.title, description=form.description, is_active=form.is_active)
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    
    for field in form.fields:
        db_field = models.CustomFormField(**field.model_dump(), form_id=db_form.id)
        db.add(db_field)
    
    db.commit()
    db.refresh(db_form)
    return db_form

@app.put("/api/forms/{form_id}", response_model=schemas.CustomFormResponse)
def update_form(form_id: int, form: schemas.CustomFormUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_form = db.query(models.CustomForm).filter(models.CustomForm.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    db_form.title = form.title
    db_form.description = form.description
    db_form.is_active = form.is_active
    
    # Delete old fields
    db.query(models.CustomFormField).filter(models.CustomFormField.form_id == form_id).delete()
    
    # Add new fields
    for field in form.fields:
        db_field = models.CustomFormField(**field.model_dump(), form_id=db_form.id)
        db.add(db_field)
        
    db.commit()
    db.refresh(db_form)
    return db_form

@app.delete("/api/forms/{form_id}")
def delete_form(form_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_form = db.query(models.CustomForm).filter(models.CustomForm.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(db_form)
    db.commit()
    return {"message": "Form deleted"}

@app.post("/api/forms/{form_id}/submit", response_model=schemas.CustomFormSubmissionResponse)
def submit_form(form_id: int, submission: schemas.CustomFormSubmissionCreate, db: Session = Depends(get_db)):
    db_form = db.query(models.CustomForm).filter(models.CustomForm.id == form_id).first()
    if not db_form or not db_form.is_active:
        raise HTTPException(status_code=404, detail="Form not found or inactive")
        
    db_submission = models.CustomFormSubmission(data=submission.data, form_id=form_id)
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

@app.get("/api/forms/{form_id}/submissions", response_model=List[schemas.CustomFormSubmissionResponse])
def get_form_submissions(form_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.CustomFormSubmission).filter(models.CustomFormSubmission.form_id == form_id).all()
