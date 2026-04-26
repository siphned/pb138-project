# 🛒 E-Shop

Today, you will get to play around with an almost-finished interface for an eshop
that sells electronics and would like to have some product management as a feature.

## Task 01

Your first task is to finish teh implmementation of API endpoints
in `server/src/index.ts`

The types and some endpoints are already implemented, all you need to do is
finish the not implemented ones:

`/products:id` - Finish implementation of the GET endpoint for a singular product.
`/products` - Finish implementation fo the POST endpoint for creating a product. 


## Task 02

After helping finish the backend, you will need to finish the API specification accordingly, located in the
root folder in `openapi.yaml`

Then `cd` into `client` folder and use `npx kubb generate` to generate Kubb types.


## Task 03

The last task is to finish the client implementation in `client/src/ProductPage.tsx` using TanStack Query.
You will need to ensure that Products for the eshop get loaded correctly, as well as that they can be created and removed without error.

For proper testing, you will want to start the development server in by calling `npm run dev` in the `server` folder.
The server runs on port 3000 by default and the demo client expects this to be the case.


If you have finished all the tasks, then congratulations, the seminar is finished!
