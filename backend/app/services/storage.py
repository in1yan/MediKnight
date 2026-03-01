import uuid
from typing import Optional

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.supabase import supabase_client


class StorageService:
    """Service for handling file uploads to Supabase Storage"""

    def __init__(self, bucket_name: str = "posters"):
        self.bucket_name = bucket_name

    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "thumbnails",
        custom_filename: Optional[str] = None,
    ) -> str:
        """
        Upload a file to Supabase Storage bucket

        Args:
            file: The file to upload (FastAPI UploadFile)
            folder: Folder path in the bucket (default: "thumbnails")
            custom_filename: Optional custom filename. If None, generates unique filename

        Returns:
            Public URL of the uploaded file

        Raises:
            HTTPException: If upload fails or file type is not allowed
        """
        # Validate file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        await file.seek(0)  # Reset file pointer

        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes",
            )

        # Validate file extension
        if file.filename:
            file_extension = file.filename.split(".")[-1].lower()
            if file_extension not in settings.ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type .{file_extension} not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must have a filename with extension",
            )

        if custom_filename:
            filename = custom_filename
        else:
            unique_id = str(uuid.uuid4())
            filename = f"{unique_id}.{file_extension}"

        file_path = f"{folder}/{filename}"

        content_type = file.content_type or self._get_content_type(file_extension)

        try:
            # Upload file to Supabase Storage
            await file.seek(0)
            file_content = await file.read()

            supabase_client.storage.from_(self.bucket_name).upload(
                file_path,
                file_content,
                {"content-type": content_type, "upsert": "true"},
            )

            public_url = supabase_client.storage.from_(self.bucket_name).get_public_url(
                file_path
            )

            return public_url

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}",
            )

    def get_public_url(self, file_path: str) -> str:
        """
        Get the public URL for a file in the bucket

        Args:
            file_path: Path of the file in the bucket

        Returns:
            Public URL of the file
        """
        try:
            return supabase_client.storage.from_(self.bucket_name).get_public_url(
                file_path
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get public URL: {str(e)}",
            )

    def _get_content_type(self, file_extension: str) -> str:
        """
        Get content type based on file extension

        Args:
            file_extension: File extension without dot

        Returns:
            MIME type string
        """
        content_types = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp",
            "mp4": "video/mp4",
            "mkv": "video/x-matroska",
            "avi": "video/x-msvideo",
            "pdf": "application/pdf",
        }
        return content_types.get(file_extension.lower(), "application/octet-stream")


movie_storage_service = StorageService(bucket_name=settings.SUPABASE_STORAGE_BUCKET)
