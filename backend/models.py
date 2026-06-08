from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String, nullable=False)
    label = Column(String, nullable=False)
    description = Column(String, nullable=True)

class ServiceCard(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    number = Column(String, nullable=False)
    description = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    is_full_width = Column(Boolean, default=False)

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    interest = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContentItem(Base):
    __tablename__ = "contents"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)

class GalleryAlbum(Base):
    __tablename__ = "gallery_albums"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    coverImage = Column(String, nullable=False)
    is_hidden = Column(Boolean, default=False)
    linked_article_id = Column(Integer, ForeignKey("news_articles.id"), nullable=True)
    
    photos = relationship("GalleryPhoto", back_populates="album", cascade="all, delete-orphan")

class GalleryPhoto(Base):
    __tablename__ = "gallery_photos"

    id = Column(Integer, primary_key=True, index=True)
    album_id = Column(Integer, ForeignKey("gallery_albums.id"))
    url = Column(String, nullable=False)
    
    album = relationship("GalleryAlbum", back_populates="photos")

class NewsCategory(Base):
    __tablename__ = "news_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    coverImage = Column(String, nullable=False)
    
    articles = relationship("NewsArticle", back_populates="category", cascade="all, delete-orphan")

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("news_categories.id"))
    title = Column(String, nullable=False)
    excerpt = Column(String, nullable=False)
    date = Column(String, nullable=False)
    imageUrl = Column(String, nullable=False)
    content = Column(String, nullable=True)
    is_hidden = Column(Boolean, default=False)
    is_popup = Column(Boolean, default=False)
    linked_album_id = Column(Integer, ForeignKey("gallery_albums.id"), nullable=True)
    linked_form_id = Column(Integer, ForeignKey("custom_forms.id"), nullable=True)
    
    category = relationship("NewsCategory", back_populates="articles")
    comments = relationship("NewsComment", back_populates="article", cascade="all, delete-orphan")

class NewsComment(Base):
    __tablename__ = "news_comments"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("news_articles.id"))
    name = Column(String, nullable=False)
    text = Column(String, nullable=False)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("NewsArticle", back_populates="comments")

class CustomForm(Base):
    __tablename__ = "custom_forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    fields = relationship("CustomFormField", back_populates="form", cascade="all, delete-orphan")
    submissions = relationship("CustomFormSubmission", back_populates="form", cascade="all, delete-orphan")

class CustomFormField(Base):
    __tablename__ = "custom_form_fields"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("custom_forms.id"))
    label = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    required = Column(Boolean, default=False)
    options = Column(String, nullable=True)

    form = relationship("CustomForm", back_populates="fields")

class CustomFormSubmission(Base):
    __tablename__ = "custom_form_submissions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("custom_forms.id"))
    data = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    form = relationship("CustomForm", back_populates="submissions")
