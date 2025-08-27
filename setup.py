from setuptools import setup, find_packages

setup(
    name="contract-ai",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'fastapi>=0.104.1',
        'uvicorn[standard]>=0.24.0',
        'python-multipart>=0.0.6',
        'python-dotenv>=1.0.0',
        'pydantic>=2.5.0',
        'aiofiles>=23.2.1',
        'PyPDF2>=3.0.1',
        'python-docx>=1.1.0',
        'google-generativeai>=0.7.2'
    ],
)
