import * as Yup from 'yup';

import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliverymen.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const alreadyExists = await Deliverymen.findOne({
      where: { email: req.body.email },
    });

    if (alreadyExists) {
      return res.status(401).json({ error: 'Deliveryman already exists' });
    }

    const { id, name, email } = await Deliverymen.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const { email } = req.body;

    if (email && email !== deliveryman.email) {
      const alreadyExists = await Deliverymen.findOne({
        where: { email },
      });

      if (alreadyExists) {
        return res.status(401).json({ error: 'Deliveryman already exists' });
      }
    }

    const { name } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    deliveryman.destroy();

    return res.json();
  }

  async upload(req, res) {
    const { id } = req.params;
    const { originalname: name, filename: path } = req.file;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    const file = await File.create({
      name,
      path,
    });

    deliveryman.avatar_id = file.id;
    deliveryman.save();

    return res.json(file);
  }
}

export default new DeliverymanController();
