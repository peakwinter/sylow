import Document from '../models/document.model';
import Entity from '../models/entity.model';


export function index(req, res, next) {
  Document.aggregate([
    {
      $sortByCount: '$contentType'
    }
  ])
    .then(results => res.render('index', { active: 'index', contentTypes: results }))
    .catch(next);
}

export function listEntities(req, res) {
  return Entity.find()
    .then(entities => res.render('entities', { ctrl: 'entity', active: 'entities', entities }))
    .catch(message => res.render('error', { ctrl: 'entity', message }));
}

export function createEntity(req, res) {
  const entity = new Entity({
    username: req.body.username,
    passwordHash: req.body.passwordHash,
    passwordSalt: req.body.passwordSalt,
    authoritative: true,
    admin: req.body.admin
  });

  return entity.save()
    .then(() => {
      req.flash('success', 'Entity created');
      return res.redirect('/entities');
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}
