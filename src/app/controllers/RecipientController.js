import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      post_code: Yup.string()
        .min(8)
        .max(8)
        .required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      state: Yup.string()
        .min(2)
        .max(2)
        .required(),
      city: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      id,
      name,
      post_code,
      street,
      number,
      complement,
      state,
      city,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      post_code,
      street,
      number,
      complement,
      state,
      city,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      post_code: Yup.string()
        .min(8)
        .max(8)
        .required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      state: Yup.string()
        .min(2)
        .max(2)
        .required(),
      city: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const {
      name,
      post_code,
      street,
      number,
      complement,
      state,
      city,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      post_code,
      street,
      number,
      complement,
      state,
      city,
    });
  }
}

export default new RecipientController();
