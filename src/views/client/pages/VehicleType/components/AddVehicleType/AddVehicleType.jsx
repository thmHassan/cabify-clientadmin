import CardContainer from "../../../../../../components/shared/CardContainer";
import PageTitle from "../../../../../../components/ui/PageTitle/PageTitle";

// const AddVehicleType = ({ isOpen, setIsOpen }) => {
//   return (
//       <div className="px-4 py-5 sm:p-6 lg:p-10 min-h-[calc(100vh-85px)]">
//       <div className="flex justify-between sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-0 2xl:mb-6 1.5xl:mb-10 mb-0">
//         <div className="sm:mb-[30px] mb-1 sm:w-[calc(100%-240px)] w-full flex gap-5 items-center">
//           <div className="flex flex-col gap-2.5 w-[calc(100%-100px)]">
//             <PageTitle title="Add Vehicle Types" />
//           </div>
//         </div>
//       </div>
//       <div>
//         <CardContainer className="p-3 sm:p-4 lg:p-5 bg-[#F5F5F5]">
//             <div className="flex flex-col gap-4 pt-4"> 
//                 <p>This is where the form to add a new vehicle type will go.</p>
//             </div>
//         </CardContainer>
//       </div>
//     </div>
//   );
// }

// export default AddVehicleType;
const AddVehicleType = ({ isOpen, setIsOpen }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <PageTitle title="Add Vehicle Type" />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xl font-bold"
          >
            ×
          </button>
        </div>

        <CardContainer className="p-4 bg-[#F5F5F5]">
          <p>Your form goes here...</p>
        </CardContainer>
      </div>
    </div>
  );
};

export default AddVehicleType;