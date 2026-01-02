import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Fetch Companies
export async function getCompanies(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error("Error fetching Companies:", error);
    return null;
  }

  return data;
}

// Add Company
export async function addNewCompany(token, _, companyData) {
  const supabase = await supabaseClient(token);

  const random = Math.floor(Math.random() * 90000);
  
  // 1. Extract extension safely
  const fileExt = companyData.logo?.name.split(".").pop();
  
  // 2. Sanitize company name (remove spaces/special chars)
  // Example: "My Company Inc." -> "My-Company-Inc"
  const sanitizedName = companyData.name.replace(/[^a-zA-Z0-9]/g, '-');
  
  const fileName = `logo-${random}-${sanitizedName}.${fileExt}`;

  const { error: storageError } = await supabase.storage
    .from("company-logo")
    .upload(fileName, companyData.logo);

  // 3. Log the ACTUAL error to seeing what's wrong
  if (storageError) {
    console.error("SUPABASE STORAGE ERROR:", storageError);
    throw new Error("Error uploading Company Logo");
  }

  const logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;

  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        name: companyData.name,
        logo_url: logo_url,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error submitting Company");
  }

  return data;
}