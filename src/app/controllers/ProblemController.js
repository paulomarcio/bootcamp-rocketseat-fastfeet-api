import * as Yup from 'yup';
import { parseISO, format } from 'date-fns';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';
import Recipient from '../models/Recipient';
import Deliverymen from '../models/Deliverymen';

import Mail from '../../libs/Mail';

class ProblemController {
  async index(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const problems = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      attributes: ['description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['product', 'start_date'],
        },
      ],
    });

    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      attributes: ['product', 'start_date'],
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const { description } = req.body;
    const problem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.json({ id: problem.id, description, delivery });
  }

  async delete(req, res) {
    const { id } = req.params;
    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const momentHour = parseISO(format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"));
    const delivery = await Delivery.findByPk(problem.delivery_id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['product'],
        },
        {
          model: Deliverymen,
          as: 'deliveryman',
          attributes: ['name'],
        },
      ],
    });

    delivery.canceled_at = momentHour;
    await delivery.save();

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        name: delivery.deliveryman.name,
        product: delivery.product,
        address: `${delivery.recipient.street}, ${delivery.recipient.number}, ${delivery.recipient.complement}, ${delivery.recipient.city}, ${delivery.recipient.state}`,
        description: problem.description,
      },
    });

    return res.json();
  }
}

export default new ProblemController();
