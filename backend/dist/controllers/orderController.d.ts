import { Request, Response } from 'express';
export declare const getAllOrders: (req: Request, res: Response) => void;
export declare const getOrder: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const createOrder: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const updateOrderStatus: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const getStatusUpdates: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const deleteOrder: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=orderController.d.ts.map