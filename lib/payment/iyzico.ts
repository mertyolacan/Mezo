// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay");

function getClient() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
  });
}

export type IyzicoItem = {
  id: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  price: string; // "49.90"
};

export type IyzicoAddress = {
  contactName: string;
  city: string;
  country: string;
  address: string;
};

export type InitializePaymentParams = {
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: "TRY";
  basketId: string;
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  };
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoItem[];
};

export function initializeCheckoutForm(params: InitializePaymentParams): Promise<{
  status: string;
  errorCode?: string;
  errorMessage?: string;
  checkoutFormContent?: string;
  token?: string;
  tokenExpireTime?: number;
}> {
  return new Promise((resolve, reject) => {
    getClient().checkoutFormInitialize.create(params, (err: unknown, result: unknown) => {
      if (err) reject(err);
      else resolve(result as ReturnType<typeof resolve> extends Promise<infer T> ? T : never);
    });
  });
}

export function retrieveCheckoutForm(token: string, conversationId: string): Promise<{
  status: string;
  errorCode?: string;
  errorMessage?: string;
  paymentStatus?: string;
  paymentId?: string;
  fraudStatus?: number;
  price?: string;
  paidPrice?: string;
  basketId?: string;
  conversationId?: string;
}> {
  return new Promise((resolve, reject) => {
    getClient().checkoutForm.retrieve({ token, conversationId }, (err: unknown, result: unknown) => {
      if (err) reject(err);
      else resolve(result as ReturnType<typeof resolve> extends Promise<infer T> ? T : never);
    });
  });
}
