import { models, sequelize } from '@/database';
import { service } from '@/lib/decorators';

@service
export default class Utility {
  async create(data) {
    const transaction = await sequelize.transaction();
    try {
      const { products, ...rest } = data;
      const order = await models.Order.create(rest, { transaction });
      await models.OrderToProducts.bulkCreate(products.map(data => ({ ...data, orderId: order.id })), { transaction });
      await transaction.commit();
      return order;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getOne(id) {
    const order = await models.Order.findByPk(id);
    return order;
  }

  async getList(filters) {
    const orders = await models.Order
      .scope(
        { method: ['filter', filters] },
        { method: ['pagination', filters] }
      )
      .findAll({
        include: [
          {
            model: models.OrderToProducts,
            as: 'products',
            attributes: ['price', 'count'],
            include: [{
              model: models.Product,
              as: 'product',
              attributes: ['id', 'name'],
            }]
          }
        ]
      });
    return orders;
  }
}
