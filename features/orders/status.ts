import type { OrderStatus } from "@/lib/generated/prisma/enums";

export const ORDER_STATUS: Record<OrderStatus, { label: string; customerText: string }> = {
  PENDING: {
    label: "অপেক্ষমান",
    customerText: "আমরা আপনার অর্ডার পেয়েছি এবং নিশ্চিত করতে আপনার সাথে যোগাযোগ করব।",
  },
  CONFIRMED: {
    label: "নিশ্চিত হয়েছে",
    customerText: "আপনার অর্ডার নিশ্চিত হয়েছে এবং আমরা আপনার শাড়ি প্রস্তুত করছি।",
  },
  PREPARING: {
    label: "প্রস্তুত হচ্ছে",
    customerText: "আপনার শাড়ি যাচাই ও প্যাক করা হচ্ছে।",
  },
  SHIPPED: {
    label: "পাঠানো হয়েছে",
    customerText: "আপনার অর্ডার পথে আছে। কুরিয়ারের জন্য ক্যাশ প্রস্তুত রাখুন।",
  },
  DELIVERED: {
    label: "ডেলিভারি হয়েছে",
    customerText: "আপনার অর্ডার পৌঁছে গেছে। আমাদের কাছ থেকে কেনাকাটার জন্য ধন্যবাদ!",
  },
  CANCELLED: {
    label: "বাতিল হয়েছে",
    customerText: "এই অর্ডারটি বাতিল করা হয়েছে। কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।",
  },
  RETURNED: {
    label: "ফেরত দেওয়া হয়েছে",
    customerText: "এই অর্ডারটি ফেরত দেওয়া হয়েছে। কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।",
  },
};

// The normal path of an order, used to draw progress for customers.
export const ORDER_PROGRESS: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

// Usual next steps, offered as main actions in the admin. Admins can still
// pick any other status to correct mistakes.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

// Orders that don't count as sales.
export const NON_SALE_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

export const ALL_STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[];
