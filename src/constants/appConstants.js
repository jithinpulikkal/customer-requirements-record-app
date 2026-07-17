export const STORAGE_KEYS = {
  entries: "customer_requirement_entries_v1",
  customers: "customer_requirement_customers_v1",
  customStatuses: "customer_requirement_custom_statuses_v1",
  types: "customer_requirement_types_v1",
  profile: "customer_requirement_profile_v1",
  loggedIn: "customer_requirement_logged_in_v1",
  theme: "customer_requirement_theme_v1"
};

export const APP_DETAILS = {
  name: "Customer Requirements",
  version: "1.0.0",
  storage: "On-device phone storage",
  backend: "No backend or network required"
};

export const themes = {
  light: {
    mode: "light",
    page: "bg-[#eef0f4]",
    card: "bg-white",
    cardAlt: "bg-[#f6f7f9]",
    text: "text-[#20252d]",
    muted: "text-[#7b8491]",
    border: "border-[#edf0f4]",
    header: "bg-[#eef0f4]",
    bottom: "bg-[#20252d] border-[#303846]",
    primary: "bg-[#20252d]",
    primaryText: "text-white",
    accentText: "text-[#f26d5b]",
    accentBg: "bg-[#fff2ef]",
    accentColor: "#f26d5b",
    iconMuted: "#8d96a3",
    input: "bg-white border-[#dde2ea] text-[#20252d]",
    inputMuted: "text-[#7b8491]"
  },
  dark: {
    mode: "dark",
    page: "bg-[#171717]",
    card: "bg-[#232323]",
    cardAlt: "bg-[#303030]",
    text: "text-[#f4f1ea]",
    muted: "text-[#a9a49b]",
    border: "border-[#3a3a3a]",
    header: "bg-[#171717]",
    bottom: "bg-[#050505] border-[#474747]",
    primary: "bg-[#f4f1ea]",
    primaryText: "text-[#171717]",
    accentText: "text-[#f4f1ea]",
    accentBg: "bg-[#3a3a3a]",
    accentColor: "#f4f1ea",
    iconMuted: "#8f8a82",
    input: "bg-[#303030] border-[#474747] text-[#f4f1ea]",
    inputMuted: "text-[#a9a49b]"
  }
};



export const defaultTypes = [];

export const defaultProfile = {
  businessName: "My Business",
  ownerName: "",
  phone: "",
  email: "",
  place: "",
  photoUri: ""
};

export const emptyForm = {
  date: "",
  slno: "",
  name: "",
  phone: "",
  detail1: "",
  detail2: "",
  detail3: "",
  type: "",
  notes: "",
  status: ""
};

export const emptyCustomerForm = {
  name: "",
  details: "",
  location: "",
  phone: ""
};

export const emptyStatusForm = {
  name: ""
};

export const emptyTypeForm = {
  name: ""
};
