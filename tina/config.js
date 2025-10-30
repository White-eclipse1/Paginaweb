import { defineConfig } from "tinacms";

// Configuración de TinaCMS
export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: ".",
  },

  media: {
    tina: {
      mediaRoot: "assets/uploads",
      publicFolder: ".",
    },
  },

  schema: {
    collections: [
      {
        name: "updates",
        label: "Noticias / Lanzamientos",
        path: "_updates",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Título",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Fecha",
            required: true,
          },
          {
            type: "string",
            name: "kind",
            label: "Tipo",
            options: ["Noticia", "Lanzamiento"],
            required: true,
          },
          {
            type: "string",
            name: "excerpt",
            label: "Resumen",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "cover",
            label: "Imagen de portada",
          },
          {
            type: "string",
            name: "price",
            label: "Precio",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Contenido",
            isBody: true,
          },
        ],
      },
      {
        name: "jobs",
        label: "Bolsa de trabajo",
        path: "_jobs",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Título del puesto",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Fecha de publicación",
            required: true,
          },
          {
            type: "string",
            name: "location",
            label: "Ubicación",
          },
          {
            type: "string",
            name: "contract_type",
            label: "Tipo de contrato",
            options: [
              "Tiempo completo",
              "Medio tiempo",
              "Prácticas",
              "Freelance",
            ],
            required: true,
          },
          {
            type: "string",
            name: "salary",
            label: "Salario",
          },
          {
            type: "datetime",
            name: "deadline",
            label: "Fecha límite",
          },
          {
            type: "string",
            name: "apply_link",
            label: "Enlace para aplicar",
          },
          {
            type: "string",
            name: "apply_email",
            label: "Correo para aplicar",
          },
          {
            type: "string",
            name: "excerpt",
            label: "Descripción breve",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Detalles del puesto",
            isBody: true,
          },
        ],
      },
    ],
  },
});