import * as Yup from 'yup';
import { parseISO, format } from 'date-fns';

import Delivery from '../models/Delivery';
import DeliveryProblem from '../models/DeliveryProblem';

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

    const delivery = await Delivery.findByPk(problem.delivery_id);
    const momentHour = parseISO(format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"));

    delivery.canceled_at = momentHour;
    await delivery.save();

    return res.json();
  }
}

export default new ProblemController();
