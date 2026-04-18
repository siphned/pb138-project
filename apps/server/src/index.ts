import { Elysia } from 'elysia';

const app = new Elysia().get('/', () => 'Hello from API');

app.listen(3000);
