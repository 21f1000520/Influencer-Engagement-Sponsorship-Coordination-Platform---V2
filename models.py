from extentions import db, security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq

fsq.FsModels.set_db_info(db)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String, unique=False, nullable=False)
    lname = db.Column(db.String, unique=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(), nullable=False)
    roles = db.relationship('Role', secondary='user_roles')
    

    def __repr__(self):
        return f'<{self.fname} {self.lname}>'


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String)


class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


class influencer_features(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    plateforms = db.relationship('platforms', secondary='infl_plateform',
                                 back_populates='influencer_features')
    aboutMe = db.Column(db.String, unique=False, nullable=True)
    recieved_ad_req = db.relationship('recieved_ad_req', secondary='ad_req_infl_relationship',
                                      back_populates='influencer_features')
    flag = db.Column(db.Boolean, nullable=False, default=False)
    dp_name = db.Column(db.String, unique=False, nullable=True)


class sponsor_features(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    industry = db.Column(db.String, unique=False, nullable=False)
    campaigns = db.relationship('campaigns', back_populates='sponsor_features')
    flag = db.Column(db.Boolean, nullable=False, default=False)
    dp_name = db.Column(db.String, unique=False, nullable=True)

class platforms(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    influencer_features = db.relationship('influencer_features', secondary='infl_plateform',
                                          back_populates='plateforms')

    def __repr__(self):
        return f'<{self.name}>'


class campaigns(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=False)
    description = db.Column(db.String, nullable=False, unique=False)
    start_date = db.Column(db.DateTime, nullable=False, unique=False)
    end_date = db.Column(db.DateTime, nullable=False, unique=False)
    budget = db.Column(db.Float, nullable=False, unique=False)
    goals = db.Column(db.String, nullable=True, unique=False)
    visibility = db.Column(db.Boolean, nullable=False)
    flag = db.Column(db.Boolean, nullable=False, default=False)

    s_id = db.Column(db.Integer, db.ForeignKey(
        'sponsor_features.user_id', ondelete="CASCADE"), nullable=False)
    sponsor_features = db.relationship(
        "sponsor_features", back_populates="campaigns")


class ad_req_infl_relationship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    infl_id = db.Column(db.Integer, db.ForeignKey(
        'influencer_features.user_id', ondelete="CASCADE"), nullable=False)
    req_id = db.Column(db.Integer, db.ForeignKey(
        'recieved_ad_req.id', ondelete="CASCADE"), nullable=False)


class infl_plateform(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    infl_id = db.Column(db.Integer, db.ForeignKey(
        'influencer_features.user_id', ondelete="CASCADE"), nullable=False)
    plateform_id = db.Column(db.Integer, db.ForeignKey(
        'platforms.id', ondelete="CASCADE"), nullable=False)


class recieved_infl_req(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inf_id = db.Column(db.Integer, db.ForeignKey(
        'influencer_features.user_id', ondelete="CASCADE"), nullable=False)
    s_id = db.Column(db.Integer, db.ForeignKey(
        'sponsor_features.user_id', ondelete="CASCADE"), nullable=False)
    camp_id = db.Column(db.Integer, db.ForeignKey(
        'campaigns.id', ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String, nullable=False, default='pending')


class recieved_ad_req(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    infl_id = db.Column(db.Integer, db.ForeignKey(
        'influencer_features.user_id', ondelete="CASCADE"), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey(
        'campaigns.id', ondelete="CASCADE"), nullable=False)
    s_id = db.Column(db.Integer, db.ForeignKey(
        'sponsor_features.user_id', ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String, nullable=False, default='pending')
    influencer_features = db.relationship('influencer_features', secondary='ad_req_infl_relationship',
                                          back_populates='recieved_ad_req')
