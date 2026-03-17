import { z } from "zod"


export const CartItemSchema = z.object({
    roomId: z.string(),
    hours: z.number().int().positive(),
})


export const CheckoutSchema = z.object({
    items: z.array(CartItemSchema).min(1),
    startAt: z.string(),
    endAt: z.string(),
})


export type CheckoutInput = z.infer<typeof CheckoutSchema>