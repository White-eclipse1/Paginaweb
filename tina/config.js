import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  
  // Credenciales de Tina Cloud
  clientId: "db2784db-7466-4322-bc77-da4c99fcc8b9",
  token: "e299e600cea47438faa0005536f273a9bb211193",
  
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