import { Address, Company, Coupon, Customer, GiftbackConfig, LineItem, Nps, Order, Product, User } from '@ZoppyTech/models';
import { AppConstants, WcStatusConstants } from '@ZoppyTech/utilities';

export class TemplateFetchEntitiesHelper {
    public static async execute(params: Parameters): Promise<TemplateFetchEntitiesHelperResponse> {
        const response: TemplateFetchEntitiesHelperResponse = {};

        const company: Company = await Company.findByPk(params.companyId);
        const address: Address = await Address.findByPk(params.addressId);
        const customer: Customer = await Customer.findOne({
            where: {
                companyId: params.companyId,
                billingId: address.id
            }
        });

        const nps: Nps = params.npsId
            ? await Nps.findByPk(params.npsId)
            : await Nps.findOne({
                  where: {
                      customerId: customer.id,
                      companyId: params.companyId
                  }
              });

        const order: Order = params.orderId
            ? await Order.findByPk(params.orderId)
            : await Order.findOne({
                  where: {
                      status: WcStatusConstants.COMPLETED,
                      addressId: address.id
                  }
              });

        if (order) {
            const lineItems: LineItem[] = await LineItem.findAll({
                where: {
                    companyId: params.companyId,
                    orderId: order.id
                }
            });

            if (lineItems.length) {
                const products: Product[] = await Product.findAll({
                    where: {
                        companyId: params.companyId,
                        id: lineItems.map((lineItem: LineItem) => lineItem.productId)
                    }
                });
                response.lastPurchaseProducts = products;
            }
        }

        const seller: User = params.userId
            ? await User.findByPk(params.userId)
            : order?.userId
            ? await User.findByPk(order.userId)
            : customer.userId
            ? await User.findByPk(customer.userId)
            : await User.findOne({
                  where: {
                      companyId: company.id,
                      role: AppConstants.ROLES.ADMIN
                  }
              });

        const coupon: Coupon = await Coupon.findOne({
            where: {
                companyId: params.companyId,
                code: params.code ?? 'none'
            }
        });

        const giftbackConfig: GiftbackConfig = await GiftbackConfig.findOne({
            where: {
                companyId: params.companyId
            }
        });

        response.clientAddress = address;
        response.seller = seller;
        response.nps = nps;
        response.giftbackConfig = giftbackConfig;
        response.coupon = coupon;
        response.lastPurchase = order;
        response.company = company;

        return response;
    }
}

export interface Parameters {
    addressId: string;
    npsId?: string;
    orderId?: string;
    companyId: string;
    code?: string;
    userId?: string;
}

export interface TemplateFetchEntitiesHelperResponse {
    clientAddress?: Address;
    company?: Company;
    coupon?: Coupon;
    giftbackConfig?: GiftbackConfig;
    lastPurchase?: Order;
    lastPurchaseProducts?: Product[];
    nps?: Nps;
    seller?: User;
}
