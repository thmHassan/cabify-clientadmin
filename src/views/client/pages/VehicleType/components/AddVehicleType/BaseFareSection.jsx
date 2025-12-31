import { Field, ErrorMessage } from "formik";
import FormLabel from "../../../../../../components/ui/FormLabel/FormLabel";

const BaseFareSection = ({ values, setFieldValue, distanceUnit }) => {
  return (
    <div className="flex flex-row gap-3">
      <div className="flex gap-3 mt-3">
        <input
          id="base_fare_system_status"
          type="checkbox"
          checked={values.base_fare_system_status === "yes"}
          onChange={(e) =>
            setFieldValue(
              "base_fare_system_status",
              e.target.checked ? "yes" : "no"
            )
          }
          className="h-4 w-4 accent-blue-600"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <FormLabel htmlFor="base_fare_less_than_x_miles">
            Base Fare less Than (x) {distanceUnit}
          </FormLabel>
          <div className="h-14">
            <Field
              type="text"
              name="base_fare_less_than_x_miles"
              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="$0"
              disabled={values.base_fare_system_status !== "yes"}
            />
          </div>
          <ErrorMessage
            name="base_fare_less_than_x_miles"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <div>
          <FormLabel htmlFor="base_fare_less_than_x_price">
            Base Fare less Then (x) {distanceUnit} Price
          </FormLabel>
          <div className="h-14">
            <Field
              type="text"
              name="base_fare_less_than_x_price"
              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="$0"
              disabled={values.base_fare_system_status !== "yes"}
            />
          </div>
          <ErrorMessage
            name="base_fare_less_than_x_price"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <FormLabel className="text-sm font-medium text-gray-700">
            Base Fare From (x) {distanceUnit} to (X) {distanceUnit}
          </FormLabel>
          <div className="flex flex-row gap-4 w-full">
            <div>
              <div className="h-14">
                <Field
                  type="text"
                  name="base_fare_from_x_miles"
                  className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                  placeholder="$0"
                  disabled={values.base_fare_system_status !== "yes"}
                />
              </div>
              <ErrorMessage
                name="base_fare_from_x_miles"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <div className="h-14">
                <Field
                  type="text"
                  name="base_fare_to_x_miles"
                  className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
                  placeholder="$0"
                  disabled={values.base_fare_system_status !== "yes"}
                />
              </div>
              <ErrorMessage
                name="base_fare_to_x_miles"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>
        </div>

        <div>
          <FormLabel htmlFor="base_fare_from_to_price">
            Base Fare From (x) {distanceUnit} to (X) {distanceUnit} Price
          </FormLabel>
          <div className="h-14">
            <Field
              type="text"
              name="base_fare_from_to_price"
              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="$0"
              disabled={values.base_fare_system_status !== "yes"}
            />
          </div>
          <ErrorMessage
            name="base_fare_from_to_price"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <div>
          <FormLabel htmlFor="base_fare_greater_than_x_miles">
            Base Fare Greater Then (x) {distanceUnit}
          </FormLabel>
          <div className="h-14">
            <Field
              type="text"
              name="base_fare_greater_than_x_miles"
              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="$0"
              disabled={values.base_fare_system_status !== "yes"}
            />
          </div>
          <ErrorMessage
            name="base_fare_greater_than_x_miles"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <div>
          <FormLabel htmlFor="base_fare_greater_than_x_price">
            Base Fare Greater Then (x) {distanceUnit} Price
          </FormLabel>
          <div className="h-14">
            <Field
              type="text"
              name="base_fare_greater_than_x_price"
              className="sm:px-5 px-4 sm:py-[21px] py-4 border border-[#8D8D8D] rounded-lg w-full h-full shadow-[-4px_4px_6px_0px_#0000001F] placeholder:text-[#6C6C6C] sm:text-base text-sm leading-[22px] font-semibold"
              placeholder="$0"
              disabled={values.base_fare_system_status !== "yes"}
            />
          </div>
          <ErrorMessage
            name="base_fare_greater_than_x_price"
            component="div"
            className="text-red-500 text-sm mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default BaseFareSection;