
def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    elif not instance:
        instance = model(**kwargs)
        session.add(instance)
        return instance


def get_or_create_features(session, model, plateforms, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        print('found')
        return instance
    elif not instance:
        instance = model(**kwargs)
        instance.plateforms.extend(plateforms)
        session.add(instance)
        return instance
