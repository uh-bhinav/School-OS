from app.core.config import settings
from supabase import Client, create_client


class StorageClient:
    """
    A singleton class to manage the Supabase Storage client.
    """

    _instance = None
    client: Client

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)  # Fixed: UP008 - Use super() instead of super(__class__, self)
            # Initialize the Supabase client
            cls.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return cls._instance

    def upload_file(self, bucket: str, path: str, file: bytes, mime_type: str) -> str:
        """
        Uploads a file to a specified Supabase Storage bucket.

        Args:
            bucket (str): The name of the storage bucket.
            path (str): The destination path for the file within the bucket.
            file (bytes): The file content in bytes.
            mime_type (str): The MIME type of the file.

        Returns:
            str: The public URL of the uploaded file (though we'll use signed URLs).
        """
        try:
            # The upsert=True option will overwrite the file if it already exists.
            self.client.storage.from_(bucket).upload(path=path, file=file, file_options={"content-type": mime_type, "upsert": "true"})  # Fixed: F841 - Removed unused variable
            # It's good practice to return the path, which is the key to accessing the file.
            return path
        except Exception as e:
            # Add more specific error handling as needed
            raise e

    def generate_signed_url(self, bucket: str, path: str, expires_in: int) -> str:
        """
        Generates a time-limited signed URL for a file.

        Args:
            bucket (str): The name of the storage bucket.
            path (str): The path to the file.
            expires_in (int): The validity duration of the URL in seconds.

        Returns:
            str: The signed URL.
        """
        try:
            response = self.client.storage.from_(bucket).create_signed_url(path=path, expires_in=expires_in)
            return response["signedURL"]
        except Exception as e:
            raise e

    def delete_file(self, bucket: str, path: str) -> None:
        """
        Deletes a file from a storage bucket.

        Args:
            bucket (str): The name of the storage bucket.
            path (str): The path to the file to be deleted.
        """
        try:
            self.client.storage.from_(bucket).remove([path])
        except Exception as e:
            raise e


# Create a single instance of the client to be used throughout the application
storage_client = StorageClient()
