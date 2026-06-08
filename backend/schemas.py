from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MetricBase(BaseModel):
    value: str
    label: str
    description: Optional[str] = None

class MetricUpdate(MetricBase):
    pass

class MetricResponse(MetricBase):
    id: int
    class Config:
        from_attributes = True

class ServiceCardBase(BaseModel):
    title: str
    number: str
    description: str
    image_url: str
    is_full_width: bool = False

class ServiceCardCreate(ServiceCardBase):
    pass

class ServiceCardUpdate(ServiceCardBase):
    pass

class ServiceCardResponse(ServiceCardBase):
    id: int
    class Config:
        from_attributes = True

class VolunteerBase(BaseModel):
    name: str
    email: str
    phone: str
    interest: str
    message: str

class VolunteerCreate(VolunteerBase):
    pass

class VolunteerResponse(VolunteerBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ContentItemResponse(BaseModel):
    key: str
    value: str
    class Config:
        from_attributes = True

class ContentUpdate(BaseModel):
    updates: dict[str, Optional[str]]

class PhotoBase(BaseModel):
    url: str

class PhotoCreate(PhotoBase):
    pass

class PhotoResponse(PhotoBase):
    id: int
    album_id: int
    class Config:
        from_attributes = True

class AlbumBase(BaseModel):
    title: str
    date: str
    coverImage: str
    is_hidden: bool = False
    linked_article_id: Optional[int] = None

class AlbumCreate(AlbumBase):
    pass

class AlbumResponse(AlbumBase):
    id: int
    photos: List[PhotoResponse] = []
    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    title: str
    excerpt: str
    date: str
    imageUrl: str
    content: Optional[str] = None
    is_hidden: bool = False
    is_popup: bool = False
    linked_album_id: Optional[int] = None
    linked_form_id: Optional[int] = None

class ArticleCreate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    category_id: int
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: str
    coverImage: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    articles: List[ArticleResponse] = []
    class Config:
        from_attributes = True

class CustomFormFieldBase(BaseModel):
    label: str
    field_type: str
    required: bool = False
    options: Optional[str] = None

class CustomFormFieldCreate(CustomFormFieldBase):
    pass

class CustomFormFieldResponse(CustomFormFieldBase):
    id: int
    form_id: int
    class Config:
        from_attributes = True

class CustomFormBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True

class CustomFormCreate(CustomFormBase):
    fields: List[CustomFormFieldCreate]

class CustomFormUpdate(CustomFormBase):
    fields: List[CustomFormFieldCreate]

class CustomFormResponse(CustomFormBase):
    id: int
    created_at: datetime
    fields: List[CustomFormFieldResponse] = []
    class Config:
        from_attributes = True

class CustomFormSubmissionBase(BaseModel):
    data: str

class CustomFormSubmissionCreate(CustomFormSubmissionBase):
    pass

class CustomFormSubmissionResponse(CustomFormSubmissionBase):
    id: int
    form_id: int
    created_at: datetime
    class Config:
        from_attributes = True
