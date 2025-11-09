import * as Yup from "yup";

export const DRIVER_DOCUMENT_VALIDATION_SCHEMA = Yup.object().shape({
  document_name: Yup.string().trim().required("Document name is required"),
  front_photo: Yup.boolean().optional(),
  back_photo: Yup.boolean().optional(),
  profile_photo: Yup.boolean().optional(),
  has_issue_date: Yup.boolean().optional(),
  has_expiry_date: Yup.boolean().optional(),
  at_least_one: Yup.boolean().test(
    "at-least-one-document-flag",
    "Select at least one document option",
    function () {
      const p = this.parent || {};
      return !!(
        p.front_photo ||
        p.back_photo ||
        p.profile_photo ||
        p.has_issue_date ||
        p.has_expiry_date
      );
    }
  ),
});
