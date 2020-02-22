import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliverymen from '../models/Deliverymen';

import Mail from '../../libs/Mail';

class DeliveryController {
  async index(req, res) {
    const deliveries = await Delivery.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Deliverymen,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'post_code',
            'street',
            'number',
            'complement',
            'city',
            'state',
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const alreadyExists = await Delivery.findOne({
      where: { recipient_id: req.body.recipient_id },
    });

    if (alreadyExists) {
      return res.status(401).json({ error: 'Recipient already registered' });
    }

    const { id, recipient_id, deliveryman_id, product } = await Delivery.create(
      req.body
    );

    const recipient = await Recipient.findByPk(recipient_id);
    const deliverymen = await Deliverymen.findByPk(deliveryman_id);

    await Mail.sendMail({
      to: `${deliverymen.name} <${deliverymen.email}>`,
      subject: 'Entrega registrada',
      template: 'delivery',
      context: {
        name: deliverymen.name,
        product,
        address: `${recipient.street}, ${recipient.number}, ${recipient.complement}, ${recipient.city}, ${recipient.state}`,
      },
    });

    return res.json({ id, recipient_id, deliveryman_id, product });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const { recipient_id, deliveryman_id, product } = await delivery.update(
      req.body
    );

    return res.json({ id, recipient_id, deliveryman_id, product });
  }

  async delete(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    delivery.canceled_at = new Date();
    await delivery.save();

    return res.json();
  }
}

export default new DeliveryController();
