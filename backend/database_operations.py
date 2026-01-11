from sqlalchemy import Table, MetaData
from database import engine

def create_table_from_model(model, table_name: str):
    metadata = MetaData()

    columns = [
        column.copy()
        for column in model.__table__.columns
    ]

    table = Table(
        table_name,
        metadata,
        *columns
    )

    metadata.create_all(engine)
    return table


def get_table_by_name(table_name: str):
    metadata = MetaData()
    return Table(
        table_name,
        metadata,
        autoload_with=engine
    )



def add_data_into_table_by_reference(table_reference: Table, data):
    with engine.begin() as conn:
        conn.execute(
            table_reference.insert().values(**data.model_dump())
        )