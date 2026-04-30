"use client";

import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  es: {
    // Header
    "header.title": "Autoservicio",
    "header.subtitle": "Acceso a Baños",
    // Footer
    "footer.title": "Baños Terminal Sur",
    // Process Steps
    "step1.title": "Elegir",
    "step1.desc": "Escoge tu servicio",
    "step2.title": "Pagar",
    "step2.desc": "Usa tu tarjeta",
    "step3.title": "Recibir",
    "step3.desc": "Obtén tu ticket",
    // Card
    "card.pay": "Pagar",
    "card.unavailable": "No disponible",
    // Page
    "page.selectService": "¡Selecciona tu Servicio!",
    "page.loading": "Cargando servicios",
    "page.errorLoading": "No se pudieron cargar los servicios",
    "page.errorInit": "Error inicializando aplicación",
    "page.remember": "Recuerde",
    "page.showerReminder": "Retirar su kit de toalla y jabón en caja",
    "page.understood": "Entendido",
    "page.processingPayment": "Procesando pago",
    "page.amount": "Monto",
    "page.followInstructions": "Siga las instrucciones del equipo...",
    "page.posUnavailable": "POS no disponible. Verifique la conexión.",
    "page.errorCreatingAccess": "Error creando acceso",
    "page.cannotCreateAccessSystem": "No se pudo crear el acceso en el sistema del torniquete",
    "page.cannotCreateAccessTryAgain": "No se pudo crear el acceso. Intente nuevamente.",
    "page.accept": "Aceptar",
    "page.paymentApproved": "Pago Aprobado",
    "page.paymentFailed": "Pago Fallido",
    "page.paymentSuccess": "Pago exitoso",
    "page.printError": "Pago procesado pero hubo un error al imprimir el comprobante",
    "page.error": "Error",
    "page.unexpectedError": "Error inesperado",
    "page.paymentProcessError": "Error al procesar pago",
    "page.serviceLoadError": "Error al cargar servicios",
    "service.Ducha": "Ducha",
    "service.Baño": "Baño",
    "service.Bano": "Baño",
    // Totem Config
    "config.title": "Configuración",
    "config.subtitle": "Ingrese el identificador único del tótem",
    "config.placeholder": "Ej: 1001",
    "config.errorEmpty": "Por favor ingrese un ID",
    "config.errorInvalid": "ID de tótem inválido",
    "config.errorConnection": "Error de conexión: No se pudo conectar con el backend local",
    "config.loading": "Validando",
    "config.submit": "Iniciar Tótem",
  },
  en: {
    "header.title": "Self-Service",
    "header.subtitle": "Restroom Access",
    "footer.title": "South Terminal Restrooms",
    "step1.title": "Choose",
    "step1.desc": "Select your service",
    "step2.title": "Pay",
    "step2.desc": "Use your card",
    "step3.title": "Receive",
    "step3.desc": "Get your ticket",
    "card.pay": "Pay",
    "card.unavailable": "Unavailable",
    "page.selectService": "Select your Service!",
    "page.loading": "Loading services",
    "page.errorLoading": "Could not load services",
    "page.errorInit": "Error initializing application",
    "page.remember": "Remember",
    "page.showerReminder": "Pick up your towel and soap kit at the counter",
    "page.understood": "Understood",
    "page.processingPayment": "Processing payment",
    "page.amount": "Amount",
    "page.followInstructions": "Follow the terminal instructions...",
    "page.posUnavailable": "POS unavailable. Please check the connection.",
    "page.errorCreatingAccess": "Error creating access",
    "page.cannotCreateAccessSystem": "Could not create access in the turnstile system",
    "page.cannotCreateAccessTryAgain": "Could not create access. Please try again.",
    "page.accept": "Accept",
    "page.paymentApproved": "Payment Approved",
    "page.paymentFailed": "Payment Failed",
    "page.paymentSuccess": "Payment successful",
    "page.printError": "Payment processed but there was an error printing the receipt",
    "page.error": "Error",
    "page.unexpectedError": "Unexpected error",
    "page.paymentProcessError": "Error processing payment",
    "page.serviceLoadError": "Error loading services",
    "service.Ducha": "Shower",
    "service.Baño": "Restroom",
    "service.Bano": "Restroom",
    "config.title": "Configuration",
    "config.subtitle": "Enter the unique totem identifier",
    "config.placeholder": "Ex: 1001",
    "config.errorEmpty": "Please enter an ID",
    "config.errorInvalid": "Invalid totem ID",
    "config.errorConnection": "Connection error: Could not connect to local backend",
    "config.loading": "Validating",
    "config.submit": "Start Totem",
  },
  pt: {
    "header.title": "Autoatendimento",
    "header.subtitle": "Acesso aos Banheiros",
    "footer.title": "Banheiros Terminal Sul",
    "step1.title": "Escolher",
    "step1.desc": "Selecione seu serviço",
    "step2.title": "Pagar",
    "step2.desc": "Use seu cartão",
    "step3.title": "Receber",
    "step3.desc": "Pegue seu bilhete",
    "card.pay": "Pagar",
    "card.unavailable": "Indisponível",
    "page.selectService": "Selecione seu Serviço!",
    "page.loading": "Carregando servicios",
    "page.errorLoading": "Não foi possível carregar os servicios",
    "page.errorInit": "Erro ao iniciar a aplicação",
    "page.remember": "Lembrete",
    "page.showerReminder": "Retire seu kit de toalha e sabonete no caixa",
    "page.understood": "Entendido",
    "page.processingPayment": "Processando pagamento",
    "page.amount": "Valor",
    "page.followInstructions": "Siga as instruções do terminal...",
    "page.posUnavailable": "POS indisponível. Verifique a conexão.",
    "page.errorCreatingAccess": "Erro ao criar acesso",
    "page.cannotCreateAccessSystem": "Não foi possível criar o acesso no sistema da catraca",
    "page.cannotCreateAccessTryAgain": "Não foi posible criar acesso. Tente novamente.",
    "page.accept": "Aceitar",
    "page.paymentApproved": "Pagamento Aprobado",
    "page.paymentFailed": "Pagamento Falhou",
    "page.paymentSuccess": "Pagamento bem-sucedido",
    "page.printError": "Pagamento processado mas houve um erro ao imprimir o recibo",
    "page.error": "Erro",
    "page.unexpectedError": "Erro inesperado",
    "page.paymentProcessError": "Erro ao processar pagamento",
    "page.serviceLoadError": "Erro ao carregar serviços",
    "service.Ducha": "Ducha",
    "service.Baño": "Banheiro",
    "service.Bano": "Banheiro",
    "config.title": "Configuração",
    "config.subtitle": "Insira o identificador exclusivo do totem",
    "config.placeholder": "Ex: 1001",
    "config.errorEmpty": "Por favor, insira um ID",
    "config.errorInvalid": "ID do totem inválido",
    "config.errorConnection": "Erro de conexão: Não foi possível conectar ao backend local",
    "config.loading": "Validando",
    "config.submit": "Iniciar Totem",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("es");

  const t = (key, fallback) => {
    return translations[language][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
