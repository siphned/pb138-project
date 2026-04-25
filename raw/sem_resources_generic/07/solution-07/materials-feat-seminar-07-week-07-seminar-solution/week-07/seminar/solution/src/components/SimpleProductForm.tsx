import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const task1Schema = z
  .object({
    name: z.string().min(2, "Name must have at least 2 characters."),
    price: z.number().positive("Price must be greater than 0."),
    hasDiscount: z.boolean(),
    discountCode: z.string().optional(),
  })
  .refine(
    (values) => {
      if (!values.hasDiscount) {
        return true;
      }

      return Boolean(values.discountCode && values.discountCode.trim().length > 0);
    },
    {
      path: ["discountCode"],
      message: "Discount code is required when discount is enabled.",
    },
  );

type Task1Values = z.infer<typeof task1Schema>;

export function SimpleProductForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Task1Values>({
    resolver: zodResolver(task1Schema),
    defaultValues: {
      name: "",
      price: 0,
      hasDiscount: false,
      discountCode: "",
    },
  });

  const hasDiscount = useWatch({ control, name: "hasDiscount" });

  const onSubmit: SubmitHandler<Task1Values> = (data) => {
    console.log("Task 1 valid data:", data);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="task1-name">Name</label>
        <input
          id="task1-name"
          className="block w-full border px-2 py-1"
          {...register("name")}
          placeholder="Product name"
        />
        {errors.name ? <p className="text-sm text-red-700">{errors.name.message}</p> : null}
      </div>

      <div>
        <label htmlFor="task1-price">Price</label>
        <input
          id="task1-price"
          type="number"
          step="0.01"
          className="block w-full border px-2 py-1"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price ? <p className="text-sm text-red-700">{errors.price.message}</p> : null}
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" {...register("hasDiscount")} />
        Has discount
      </label>

      {hasDiscount ? (
        <div>
          <label htmlFor="task1-discount">Discount code</label>
          <input
            id="task1-discount"
            className="block w-full border px-2 py-1"
            {...register("discountCode")}
            placeholder="SAVE10"
          />
          {errors.discountCode ? <p className="text-sm text-red-700">{errors.discountCode.message}</p> : null}
        </div>
      ) : null}

      <button className="block border px-3 py-1" type="submit">Submit</button>
    </form>
  );
}
