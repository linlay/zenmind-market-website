function isNonEmptyFile(value: any): value is File {
  return value !== null
    && typeof value === 'object'
    && Number.isFinite(value.size)
    && value.size > 0;
}

export function selectedFormFile(formElement: any, formData: any, fieldName: string) {
  const control = formElement?.elements?.namedItem?.(fieldName);
  const controlFile = control?.files?.[0];
  if (isNonEmptyFile(controlFile)) return controlFile;

  const formDataFile = formData?.get?.(fieldName);
  return isNonEmptyFile(formDataFile) ? formDataFile : null;
}
