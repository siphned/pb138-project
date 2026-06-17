// apps/web/scripts/refactor/debarrel-forms.ts
import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.app.json" });
const map: Record<string, string> = {
  AddressFields: "@/components/forms/AddressFields",
  FormSection: "@/components/forms/FormSection",
  ImageUploadField: "@/components/forms/ImageUploadField",
  SubmitButton: "@/components/forms/SubmitButton",
  TextareaField: "@/components/forms/TextareaField",
  TextField: "@/components/forms/TextField",
};

let _count = 0;
for (const sf of project.getSourceFiles()) {
  const decl = sf.getImportDeclaration((d) => d.getModuleSpecifierValue() === "@/components/forms");
  if (!decl) continue;
  const named = decl.getNamedImports().map((n) => n.getName());
  decl.remove();
  for (const name of named) {
    sf.addImportDeclaration({ moduleSpecifier: map[name], namedImports: [name] });
  }
  _count++;
}
await project.save();
