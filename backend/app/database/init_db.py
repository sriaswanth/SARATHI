from app.database.database import engine, Base

# Import all models
from app.models.user import User

Base.metadata.create_all(bind=engine)

print("Database created successfully!")