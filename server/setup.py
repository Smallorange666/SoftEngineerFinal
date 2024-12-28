from setuptools import setup, find_packages

setup(
    name='car_rental',
    version='1.0',
    packages=find_packages(),
    install_requires=[
        'Flask',
        'Flask-SQLAlchemy',
        'Flask-Migrate',
        'psycopg2-binary',
    ]
) 