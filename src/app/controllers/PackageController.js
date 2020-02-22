import * as Yup from 'yup';
import { parseISO, isAfter, isBefore, format } from 'date-fns';
import { Op } from 'sequelize';

import Deliverymen from '../models/Deliverymen';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class PackageController {
  async index(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    let search = { deliveryman_id: id, canceled_at: null, end_date: null };

    if (req.query.end_date) {
      search = {
        deliveryman_id: id,
        canceled_at: null,
        end_date: parseISO(req.query.end_date),
      };
    }

    const deliveries = await Delivery.findAll({
      where: search,
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
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Verifying if the deliveryman exists
    const { id } = req.params;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    // Verifying if the recipient exists
    const { recipient_id } = req.body;
    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Verifying if the withdrawal is being done between 08:00 and 18:00
    const hourStart = parseISO(format(new Date(), "yyyy-MM-dd'T'08:00:00xxx"));
    const hourEnd = parseISO(format(new Date(), "yyyy-MM-dd'T'18:00:00xxx"));
    const momentHour = parseISO(format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"));

    if (!isAfter(momentHour, hourStart) || !isBefore(momentHour, hourEnd)) {
      return res.status(401).json({ error: 'Out of time' });
    }

    // Verifying the number of withdrawals done during the day
    const deliveries = await Delivery.count({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        start_date: {
          [Op.between]: [hourStart, hourEnd],
        },
      },
    });

    // Deliverymen can't withdrawal more than 5 deliveries a day
    if (deliveries >= 5) {
      return res
        .status(401)
        .json({ error: 'You have reached the limit of withdrawals a day' });
    }

    const delivery = await Delivery.findOne({
      where: {
        deliveryman_id: id,
        recipient_id,
        canceled_at: null,
        start_date: null,
      },
      attributes: ['id', 'start_date', 'end_date'],
    });

    if (!delivery) {
      return res
        .status(404)
        .json({ error: 'Delivery not found or has already been taken' });
    }

    delivery.start_date = momentHour;
    await delivery.save();

    return res.status(200).json({});
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Verifying if the deliveryman exists and retriving tha rest of data
    const { id } = req.params;
    const { recipient_id } = req.body;
    const { filename: path } = req.file;
    const deliveryman = await Deliverymen.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const delivery = await Delivery.findOne({
      where: {
        deliveryman_id: id,
        recipient_id,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'signature_id', 'url', 'start_date', 'end_date'],
    });

    if (!delivery) {
      return res
        .status(404)
        .json({ error: 'Delivery not found or has already been finished' });
    }

    const momentHour = parseISO(format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"));

    delivery.signature_id = path;
    delivery.end_date = momentHour;
    await delivery.save();

    return res.json(delivery);
  }
}

export default new PackageController();
