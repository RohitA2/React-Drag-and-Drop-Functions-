// import React, { useState } from "react";
// import {
//   Card,
//   Button,
//   Form,
//   InputGroup,
//   Dropdown,
//   Spinner,
//   Badge,
//   Alert,
// } from "react-bootstrap";
// import {
//   X,
//   MoreVertical,
//   PlusCircle,
//   Search,
//   Settings,
//   Zap,
//   TrendingDown,
// } from "lucide-react";
// import Select from "react-select";
// import EditableQuill from "./HeaderBlocks/EditableQuill";
// import { useDispatch, useSelector } from "react-redux";
// import { createPricingBlock } from "../../store/pricingSlice";
// import { selectedUserId } from "../../store/authSlice";
// import { Modal } from "react-bootstrap";

// // Comprehensive currency list
// const currencyOptions = [
//   { value: "USD", label: "USD - US Dollar", symbol: "$" },
//   { value: "EUR", label: "EUR - Euro", symbol: "€" },
//   { value: "GBP", label: "GBP - British Pound", symbol: "£" },
//   { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
//   { value: "CAD", label: "CAD - Canadian Dollar", symbol: "CA$" },
//   { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
//   { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr" },
// ];

// const pricingOptions = [
//   { value: "fixed", label: "Fixed price", icon: "💎" },
//   { value: "approximate", label: "Approximate price", icon: "🔮" },
//   { value: "open", label: "Open account", icon: "📊" },
//   { value: "open_max", label: "Open account with max price", icon: "💰" },
// ];

// const vatOptions = [
//   { value: "inclusive", label: "VAT Inclusive", badge: "primary" },
//   { value: "exclusive", label: "VAT Exclusive", badge: "secondary" },
//   { value: "none", label: "No VAT", badge: "outline-secondary" },
//   { value: "reverse", label: "Reverse Charge", badge: "success" },
// ];

// const rutOptions = [
//   { value: "apply", label: "Apply RUT Discount", badge: "success" },
//   { value: "none", label: "No RUT Discount", badge: "secondary" },
// ];

// const rotOptions = [
//   { value: "apply", label: "Apply ROT Discount", badge: "success" },
//   { value: "none", label: "No ROT Discount", badge: "secondary" },
// ];

// const envTaxOptions = [
//   { value: "exclusive", label: "Env Tax Exclusive", badge: "warning" },
//   { value: "inclusive", label: "Env Tax Inclusive", badge: "info" },
//   { value: "none", label: "No Env Tax", badge: "secondary" },
// ];

// const PricingAndServices = ({ blockId, parentId, isPreview }) => {
//   const dispatch = useDispatch();
//   const userId = useSelector(selectedUserId);
//   const { loading } = useSelector((state) => state.pricing);

//   const [title, setTitle] = useState("Scope of Work");
//   const [packageName, setPackageName] = useState("Premium Package");
//   const [currency, setCurrency] = useState(
//     currencyOptions.find((opt) => opt.value === "SEK")
//   );
//   const [pricingType, setPricingType] = useState(pricingOptions[1]);
//   const [showPricingDropdown, setShowPricingDropdown] = useState(false);
//   const [packageDescription, setPackageDescription] = useState(
//     "Comprehensive service package designed to meet your business needs"
//   );
//   const [items, setItems] = useState([
//     {
//       name: "Consultation Service",
//       price: 1000,
//       description: "Initial consultation and planning",
//       quantity: 1,
//       vatRate: 0,
//       vatType: "exclusive",
//       rutDiscount: 0,
//       rutType: "apply",
//       rotDiscount: 0,
//       rotType: "apply",
//       envTaxRate: 0,
//       envType: "exclusive",
//     },
//   ]);
//   const [globalVatRate, setGlobalVatRate] = useState(20);
//   const [globalVatType, setGlobalVatType] = useState("exclusive");
//   const [globalRutDiscount, setGlobalRutDiscount] = useState(0);
//   const [globalRutType, setGlobalRutType] = useState("apply");
//   const [globalRotDiscount, setGlobalRotDiscount] = useState(0);
//   const [globalRotType, setGlobalRotType] = useState("apply");
//   const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(0);
//   const [globalEnvType, setGlobalEnvType] = useState("exclusive");

//   const [showModal, setShowModal] = useState(false);
//   const [currentItemIndex, setCurrentItemIndex] = useState(0);

//   // ---- Handlers ----
//   const handleAddItem = () => {
//     setItems([
//       ...items,
//       {
//         name: "",
//         price: "",
//         description: "",
//         quantity: 1,
//         vatRate: globalVatRate,
//         vatType: globalVatType,
//         rutDiscount: globalRutDiscount,
//         rutType: globalRutType,
//         rotDiscount: globalRotDiscount,
//         rotType: globalRotType,
//         envTaxRate: globalEnvTaxRate,
//         envType: globalEnvType,
//       },
//     ]);
//   };

//   const handleItemChange = (index, field, value) => {
//     const newItems = [...items];
//     newItems[index][field] = value;
//     setItems(newItems);
//   };

//   const handleRemoveItem = (index) => {
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const handleProductSettings = (index) => {
//     setCurrentItemIndex(index);
//     setShowModal(true);
//   };

//   const handleSaveSettings = () => {
//     setShowModal(false);
//   };

//   // Enhanced calculation with RUT, ROT, Environment Tax
//   const calculateItemTotals = (item) => {
//     const price = parseFloat(item.price) || 0;
//     const quantity = parseInt(item.quantity) || 1;
//     const vatRate = parseFloat(item.vatRate) || 0;
//     const rutDiscount = parseFloat(item.rutDiscount) || 0;
//     const rotDiscount = parseFloat(item.rotDiscount) || 0;
//     const envTaxRate = parseFloat(item.envTaxRate) || 0;

//     let subtotal = price * quantity;
//     let rutDiscountAmount = 0;
//     let rotDiscountAmount = 0;
//     let vatAmount = 0;
//     let envTaxAmount = 0;
//     let total = subtotal;

//     // Apply RUT discount
//     if (item.rutType === "apply" && rutDiscount > 0) {
//       rutDiscountAmount = subtotal * (rutDiscount / 100);
//       total -= rutDiscountAmount;
//     }

//     // Apply ROT discount
//     if (item.rotType === "apply" && rotDiscount > 0) {
//       rotDiscountAmount = subtotal * (rotDiscount / 100);
//       total -= rotDiscountAmount;
//     }

//     // Calculate VAT based on type
//     if ((item.vatType === "exclusive" || item.vatType === "inclusive") && vatRate > 0) {
//       vatAmount = total * (vatRate / 100);
//       if (item.vatType !== "reverse") {
//         total += vatAmount;
//       }
//     } else if (item.vatType === "reverse" && vatRate > 0) {
//       vatAmount = total * (vatRate / 100);
//     }

//     // Apply Environment Tax (assumed on base after discounts and VAT for exclusive)
//     let envBase = total;
//     if (item.envType === "none") {
//       envTaxAmount = 0;
//     } else if (item.envType === "exclusive" && envTaxRate > 0) {
//       envTaxAmount = envBase * (envTaxRate / 100);
//       total += envTaxAmount;
//     } else if (item.envType === "inclusive" && envTaxRate > 0) {
//       envTaxAmount = envBase * (envTaxRate / 100);
//       total += envTaxAmount;
//     }

//     return {
//       subtotal,
//       rutDiscountAmount,
//       rotDiscountAmount,
//       vatAmount,
//       envTaxAmount,
//       total: item.vatType === "reverse" ? total - vatAmount : total,
//     };
//   };

//   // ---- Totals ----
//   const itemTotals = items.map(calculateItemTotals);

//   const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
//   const vatTotal = itemTotals.reduce((sum, item) => sum + item.vatAmount, 0);
//   const rutDiscountTotal = itemTotals.reduce(
//     (sum, item) => sum + item.rutDiscountAmount,
//     0
//   );
//   const rotDiscountTotal = itemTotals.reduce(
//     (sum, item) => sum + item.rotDiscountAmount,
//     0
//   );
//   const envTaxTotal = itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0);
//   const rounding = 0;
//   const total = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

//   // ---- Save ----
//   const handleSaveBlock = () => {
//     dispatch(
//       createPricingBlock({
//         blockId,
//         userId,
//         parentId,
//         title,
//         packageName,
//         packageDescription,
//         currency: currency.value,
//         pricingType: pricingType.value,
//         netTotal,
//         vat: vatTotal,
//         rutDiscount: rutDiscountTotal,
//         rotDiscount: rotDiscountTotal,
//         envTax: envTaxTotal,
//         rounding,
//         total,
//         items: items.map((item, index) => ({
//           ...item,
//           ...itemTotals[index],
//         })),
//         globalVatRate,
//         globalVatType,
//         globalRutDiscount,
//         globalRutType,
//         globalRotDiscount,
//         globalRotType,
//         globalEnvTaxRate,
//         globalEnvType,
//       })
//     );
//   };

//   // Custom styles for modern look
//   const customStyles = {
//     control: (base, state) => ({
//       ...base,
//       border: state.isFocused ? "2px solid #6366f1" : "1px solid #e2e8f0",
//       borderRadius: "12px",
//       minWidth: "140px",
//       fontSize: "0.875rem",
//       backgroundColor: "white",
//       boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.1)" : "none",
//       transition: "all 0.2s ease",
//       "&:hover": {
//         borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
//       },
//     }),
//     menu: (base) => ({
//       ...base,
//       zIndex: 9999,
//       maxHeight: "300px",
//       borderRadius: "12px",
//       border: "1px solid #e2e8f0",
//       boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
//     }),
//     option: (base, state) => ({
//       ...base,
//       fontSize: "0.875rem",
//       padding: "12px 16px",
//       backgroundColor: state.isSelected
//         ? "#6366f1"
//         : state.isFocused
//           ? "#f8fafc"
//           : "white",
//       color: state.isSelected ? "white" : "inherit",
//       "&:active": {
//         backgroundColor: state.isSelected ? "#6366f1" : "#f1f5f9",
//       },
//     }),
//   };

//   const getVatBadgeVariant = (vatType) => {
//     const option = vatOptions.find((opt) => opt.value === vatType);
//     return option?.badge || "secondary";
//   };

//   return (
//     <div
//       className="container p-6 bg-white shadow-xl border border-gray-200"
//       style={{ maxWidth: "1700px" }}
//     >
//       {/* Header Section */}
//       <div className="flex justify-between items-start mb-2">
//         <div className="flex-1">
//           <Form.Control
//             type="text"
//             value={title}
//             placeholder="Title"
//             onChange={(e) => setTitle(e.target.value)}
//             className="text-5xl font-bold border-0 bg-transparent text-gray-900 p-0 focus:ring-0"
//             style={{ outline: "none", boxShadow: "none" }}
//             readOnly={isPreview}
//           />
//         </div>
//       </div>

//       {/* Main Card */}
//       <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white">
//         <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 py-4 px-6">
//           <div className="flex justify-between items-center flex-wrap gap-y-4">
//             {/* ✅ Left Side: Icon + Label */}
//             <div className="flex items-center gap-3 shrink min-w-0">
//               <Zap size={20} className="text-indigo-600 shrink-0" />
//               <span className="fw-semibold text-gray-700 whitespace-nowrap">
//                 Single option package
//               </span>
//             </div>

//             {/* ✅ Right Side: Settings Dropdown + Currency Selector */}
//             <div className="flex items-center gap-4">
//               {/* Settings Dropdown */}
//               <Dropdown align="end">
//                 <Dropdown.Toggle
//                   as="div"
//                   className="btn p-3 rounded-2xl border-0 bg-white shadow-sm hover:shadow-md transition-all"
//                   style={{ cursor: "pointer" }}
//                 >
//                   <Settings size={20} className="text-gray-600" />
//                 </Dropdown.Toggle>

//                 <Dropdown.Menu className="rounded-2xl shadow-lg border-0 p-3 min-w-80">
//                   <Dropdown.Header className="fw-bold text-gray-700">
//                     Block Settings
//                   </Dropdown.Header>
//                   <Dropdown.Item className="py-2">
//                     Change package options
//                   </Dropdown.Item>
//                   <Dropdown.Item as="div" className="py-2">
//                     <Form.Check
//                       type="switch"
//                       id="hide-summary"
//                       label="Hide summary for block"
//                       className="fw-normal"
//                     />
//                   </Dropdown.Item>
//                   <Dropdown.Divider />
//                   <div className="px-2 py-3 space-y-4">
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         💸 Global VAT Rate (%)
//                       </Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={globalVatRate}
//                         onChange={(e) =>
//                           setGlobalVatRate(parseFloat(e.target.value))
//                         }
//                         min="0"
//                         step="0.1"
//                         size="sm"
//                         className="rounded-xl"
//                       />
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         📊 Global VAT Type
//                       </Form.Label>
//                       <Form.Select
//                         value={globalVatType}
//                         onChange={(e) => setGlobalVatType(e.target.value)}
//                         size="sm"
//                         className="rounded-xl"
//                       >
//                         {vatOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         <TrendingDown size={14} className="me-1" />
//                         RUT Discount (%)
//                       </Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={globalRutDiscount}
//                         onChange={(e) =>
//                           setGlobalRutDiscount(parseFloat(e.target.value))
//                         }
//                         min="0"
//                         max="100"
//                         step="0.1"
//                         size="sm"
//                         className="rounded-xl"
//                       />
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         📊 Global RUT Type
//                       </Form.Label>
//                       <Form.Select
//                         value={globalRutType}
//                         onChange={(e) => setGlobalRutType(e.target.value)}
//                         size="sm"
//                         className="rounded-xl"
//                       >
//                         {rutOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         <TrendingDown size={14} className="me-1" />
//                         ROT Discount (%)
//                       </Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={globalRotDiscount}
//                         onChange={(e) =>
//                           setGlobalRotDiscount(parseFloat(e.target.value))
//                         }
//                         min="0"
//                         max="100"
//                         step="0.1"
//                         size="sm"
//                         className="rounded-xl"
//                       />
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         📊 Global ROT Type
//                       </Form.Label>
//                       <Form.Select
//                         value={globalRotType}
//                         onChange={(e) => setGlobalRotType(e.target.value)}
//                         size="sm"
//                         className="rounded-xl"
//                       >
//                         {rotOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         🌿 Environment Tax (%)
//                       </Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={globalEnvTaxRate}
//                         onChange={(e) =>
//                           setGlobalEnvTaxRate(parseFloat(e.target.value))
//                         }
//                         min="0"
//                         step="0.1"
//                         size="sm"
//                         className="rounded-xl"
//                       />
//                     </Form.Group>
//                     <Form.Group>
//                       <Form.Label className="small fw-semibold text-gray-700">
//                         📊 Global Env Tax Type
//                       </Form.Label>
//                       <Form.Select
//                         value={globalEnvType}
//                         onChange={(e) => setGlobalEnvType(e.target.value)}
//                         size="sm"
//                         className="rounded-xl"
//                       >
//                         {envTaxOptions.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </Form.Group>
//                   </div>
//                 </Dropdown.Menu>
//               </Dropdown>

//               {/* Currency Selector */}
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-gray-600">Currency:</span>
//                 <Select
//                   options={currencyOptions}
//                   value={currency}
//                   onChange={setCurrency}
//                   className="currency-select"
//                   classNamePrefix="select"
//                   isSearchable
//                   styles={customStyles}
//                   placeholder="Search currency..."
//                   components={{
//                     DropdownIndicator: () => (
//                       <Search size={16} className="text-gray-400 me-1" />
//                     ),
//                     IndicatorSeparator: () => null,
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </Card.Header>

//         <Card.Body className="p-6">
//           {/* Package Header */}
//           <div className="mb-6">
//             <Form.Control
//               type="text"
//               value={packageName}
//               onChange={(e) => setPackageName(e.target.value)}
//               className="text-2xl fw-bold border-0 bg-transparent px-0 mb-3 text-gray-900"
//               style={{ outline: "none", boxShadow: "none" }}
//             />

//             <EditableQuill
//               id="packageDescription"
//               value={packageDescription}
//               onChange={setPackageDescription}
//               className="text-gray-600 border-0 px-0 bg-transparent fs-6"
//               minRows={2}
//             />
//           </div>

//           {/* Items List - Single Line Layout */}
//           {items.map((item, index) => (
//             <div
//               key={index}
//               className="item-row mb-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-blue-50/30 transition-all overflow-hidden"
//               style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}
//             >
//               {/* Product Name */}
//               <div className="w-full">
//                 <InputGroup>
//                   <InputGroup.Text className="bg-white border-end-0 ps-3 rounded-s-xl">
//                     <Settings size={16} className="text-gray-400" />
//                   </InputGroup.Text>
//                   <Form.Control
//                     type="text"
//                     placeholder="Product / Service name"
//                     value={item.name}
//                     onChange={(e) => handleItemChange(index, "name", e.target.value)}
//                     className="rounded-e-2xl border-start-0"
//                   />
//                 </InputGroup>
//               </div>

//               {/* Price */}
//               <div className="w-full">
//                 <InputGroup>
//                   <InputGroup.Text className="bg-white border-end-0">
//                     <span className="fw-bold text-gray-600">
//                       {currency.symbol || currency.value}
//                     </span>
//                   </InputGroup.Text>
//                   <Form.Control
//                     type="number"
//                     placeholder="0.00"
//                     value={item.price}
//                     onChange={(e) => handleItemChange(index, "price", e.target.value)}
//                     min="0"
//                     step="0.01"
//                     className="border-start-0 rounded-e-2xl"
//                   />
//                 </InputGroup>
//               </div>

//               {/* VAT Badge */}
//               <div className="w-full text-center">
//                 <Badge
//                   bg={getVatBadgeVariant(item.vatType)}
//                   className="w-full justify-center py-2 rounded-xl"
//                 >
//                   {item.vatType === "reverse" ? "🔄 Reverse" : `VAT ${item.vatRate}%`}
//                 </Badge>
//               </div>

//               {/* Actions */}
//               <div className="w-full flex justify-end gap-2">
//                 <Button
//                   variant="outline-primary"
//                   className="rounded-xl border-0 bg-white shadow-sm hover:shadow-md"
//                   onClick={() => handleProductSettings(index)}
//                   title="Product settings"
//                 >
//                   <Settings size={16} />
//                 </Button>
//                 <Button
//                   variant="outline-danger"
//                   className="rounded-xl border-0 bg-white shadow-sm hover:shadow-md"
//                   onClick={() => handleRemoveItem(index)}
//                   title="Remove item"
//                 >
//                   <X size={16} />
//                 </Button>
//               </div>
//             </div>
//           ))}

//           {/* Add Item Button */}
//           <Button
//             variant="outline-primary"
//             className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
//             onClick={handleAddItem}
//           >
//             <PlusCircle size={20} />
//             Add Product / Service
//           </Button>
//         </Card.Body>

//         {/* Footer Totals */}
//         <Card.Footer className="bg-gray-50 border-0 py-6 px-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             {/* Summary Card */}
//             <div className="bg-white rounded-2xl shadow-sm p-5 min-w-80 flex-1">
//               <h6 className="fw-bold text-gray-700 mb-4 flex items-center gap-2">
//                 💰 Payment Summary
//               </h6>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Net total</span>
//                   <span className="fw-semibold">
//                     {currency.symbol || currency.value} {netTotal.toFixed(2)}
//                   </span>
//                 </div>

//                 {rutDiscountTotal > 0 && (
//                   <div className="flex justify-between items-center text-success">
//                     <span className="flex items-center gap-1">
//                       <TrendingDown size={14} />
//                       RUT Discount
//                     </span>
//                     <span className="fw-semibold">
//                       -{currency.symbol || currency.value}{" "}
//                       {rutDiscountTotal.toFixed(2)}
//                     </span>
//                   </div>
//                 )}

//                 {rotDiscountTotal > 0 && (
//                   <div className="flex justify-between items-center text-success">
//                     <span className="flex items-center gap-1">
//                       <TrendingDown size={14} />
//                       ROT Discount
//                     </span>
//                     <span className="fw-semibold">
//                       -{currency.symbol || currency.value}{" "}
//                       {rotDiscountTotal.toFixed(2)}
//                     </span>
//                   </div>
//                 )}

//                 {vatTotal > 0 && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">VAT ({globalVatRate}%)</span>
//                     <span className="fw-semibold">
//                       {currency.symbol || currency.value} {vatTotal.toFixed(2)}
//                     </span>
//                   </div>
//                 )}

//                 {envTaxTotal > 0 && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Environment Tax ({globalEnvTaxRate}%)</span>
//                     <span className="fw-semibold">
//                       {currency.symbol || currency.value} {envTaxTotal.toFixed(2)}
//                     </span>
//                   </div>
//                 )}

//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Rounding</span>
//                   <span className="fw-semibold">
//                     {currency.symbol || currency.value} {rounding.toFixed(2)}
//                   </span>
//                 </div>

//                 <hr className="my-3" />

//                 <div className="flex justify-between items-center fw-bold fs-5">
//                   <span>Total Amount</span>
//                   <span className="text-success">
//                     {currency.symbol || currency.value} {total.toFixed(2)}
//                   </span>
//                 </div>

//                 {items.some((item) => item.vatType === "reverse") && (
//                   <Alert variant="info" className="mt-3 small rounded-xl">
//                     <strong>Reverse Charge Applied:</strong> VAT to be paid
//                     directly to tax authority
//                   </Alert>
//                 )}
//               </div>
//             </div>

//             {/* Save Button */}
//             <Button
//               variant="success"
//               onClick={handleSaveBlock}
//               disabled={loading}
//               className="px-8 py-3 rounded-2xl fw-semibold shadow-lg hover:shadow-xl transition-all"
//             >
//               {loading ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Saving...
//                 </>
//               ) : (
//                 "💾 Save Pricing Block"
//               )}
//             </Button>
//           </div>
//         </Card.Footer>
//       </Card>

//       {/* Settings Modal */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton className="border-0 pb-0">
//           <Modal.Title className="fw-bold">⚙️ Product Settings</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="py-4">
//           {items[currentItemIndex] && (
//             <Form>
//               <div className="row g-4">
//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">
//                       Product Name
//                     </Form.Label>
//                     <Form.Control
//                       type="text"
//                       value={items[currentItemIndex].name}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "name",
//                           e.target.value
//                         )
//                       }
//                       placeholder="Enter product name"
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">Quantity</Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="1"
//                       value={items[currentItemIndex].quantity}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "quantity",
//                           parseInt(e.target.value)
//                         )
//                       }
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-12">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">Description</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={3}
//                       value={items[currentItemIndex].description}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "description",
//                           e.target.value
//                         )
//                       }
//                       placeholder="Product description"
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-4">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">Price</Form.Label>
//                     <InputGroup>
//                       <InputGroup.Text className="rounded-s-xl">
//                         {currency.symbol || currency.value}
//                       </InputGroup.Text>
//                       <Form.Control
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={items[currentItemIndex].price}
//                         onChange={(e) =>
//                           handleItemChange(
//                             currentItemIndex,
//                             "price",
//                             e.target.value
//                           )
//                         }
//                         className="rounded-e-xl"
//                       />
//                     </InputGroup>
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-4">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">
//                       VAT Rate (%)
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       step="0.1"
//                       value={items[currentItemIndex].vatRate}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "vatRate",
//                           parseFloat(e.target.value)
//                         )
//                       }
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-4">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">
//                       Environment Tax (%)
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       step="0.1"
//                       value={items[currentItemIndex].envTaxRate}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "envTaxRate",
//                           parseFloat(e.target.value)
//                         )
//                       }
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold flex items-center gap-1">
//                       <TrendingDown size={14} className="me-1" />
//                       RUT Discount (%)
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       max="100"
//                       step="0.1"
//                       value={items[currentItemIndex].rutDiscount}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "rutDiscount",
//                           parseFloat(e.target.value)
//                         )
//                       }
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold flex items-center gap-1">
//                       <TrendingDown size={14} className="me-1" />
//                       ROT Discount (%)
//                     </Form.Label>
//                     <Form.Control
//                       type="number"
//                       min="0"
//                       max="100"
//                       step="0.1"
//                       value={items[currentItemIndex].rotDiscount}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "rotDiscount",
//                           parseFloat(e.target.value)
//                         )
//                       }
//                       className="rounded-xl"
//                     />
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">VAT Type</Form.Label>
//                     <Form.Select
//                       value={items[currentItemIndex].vatType}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "vatType",
//                           e.target.value
//                         )
//                       }
//                       className="rounded-xl"
//                     >
//                       {vatOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">RUT Type</Form.Label>
//                     <Form.Select
//                       value={items[currentItemIndex].rutType}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "rutType",
//                           e.target.value
//                         )
//                       }
//                       className="rounded-xl"
//                     >
//                       {rutOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">ROT Type</Form.Label>
//                     <Form.Select
//                       value={items[currentItemIndex].rotType}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "rotType",
//                           e.target.value
//                         )
//                       }
//                       className="rounded-xl"
//                     >
//                       {rotOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </div>

//                 <div className="col-md-6">
//                   <Form.Group>
//                     <Form.Label className="fw-semibold">Env Tax Type</Form.Label>
//                     <Form.Select
//                       value={items[currentItemIndex].envType}
//                       onChange={(e) =>
//                         handleItemChange(
//                           currentItemIndex,
//                           "envType",
//                           e.target.value
//                         )
//                       }
//                       className="rounded-xl"
//                     >
//                       {envTaxOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </div>

//                 {/* Calculation Preview */}
//                 <div className="col-12">
//                   <div className="bg-linear-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
//                     <h6 className="fw-bold mb-3">📊 Calculation Preview</h6>
//                     <div className="row small text-gray-700">
//                       <div className="col-md-3 mb-2">
//                         <div>Subtotal:</div>
//                         <div className="fw-semibold">
//                           {currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).subtotal.toFixed(2)}
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-2">
//                         <div>RUT Discount:</div>
//                         <div className="fw-semibold text-success">
//                           -{currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).rutDiscountAmount.toFixed(2)}
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-2">
//                         <div>ROT Discount:</div>
//                         <div className="fw-semibold text-success">
//                           -{currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).rotDiscountAmount.toFixed(2)}
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-2">
//                         <div>Environment Tax:</div>
//                         <div className="fw-semibold text-warning">
//                           {currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).envTaxAmount.toFixed(2)}
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-2">
//                         <div>VAT ({items[currentItemIndex].vatRate}%):</div>
//                         <div className="fw-semibold">
//                           {currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).vatAmount.toFixed(2)}
//                         </div>
//                       </div>
//                       <div className="col-md-3 mb-2">
//                         <div>Total:</div>
//                         <div className="fw-bold fs-6 text-success">
//                           {currency.symbol || currency.value}{" "}
//                           {calculateItemTotals(
//                             items[currentItemIndex]
//                           ).total.toFixed(2)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="border-0">
//           <Button
//             variant="outline-secondary"
//             onClick={() => setShowModal(false)}
//             className="rounded-xl"
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleSaveSettings}
//             className="rounded-xl"
//           >
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <style>{`
//         /* Modern typography */
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
//         body, .fw-normal {
//           font-family: 'Inter', sans-serif;
//         }
        
//         .font-bold {
//           font-weight: 700;
//         }
        
//         .fw-semibold {
//           font-weight: 600;
//         }

//         /* Color Palette & Gradients */
//         :root {
//           --primary-color: #4f46e5; /* A vibrant indigo */
//           --primary-light: #eef2ff; /* A soft background for the header */
//           --secondary-color: #1f2937; /* Dark charcoal for text */
//           --success-color: #059669; /* Deep green */
//           --warning-color: #f59e0b; /* Warning color for Environment Tax */
//           --background-gradient: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
//           --card-gradient: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
//         }

//         .bg-gradient-to-br {
//           background: var(--background-gradient);
//         }

//         .from-blue-50 {
//           background-color: var(--primary-light) !important;
//         }

//         .to-indigo-50 {
//           background-color: var(--primary-light) !important;
//         }

//         .bg-gradient-to-r {
//           background: linear-gradient(to right, #eef2ff, #e0e7ff) !important;
//         }

//         .bg-gray-50 {
//           background-color: #f9fafb !important;
//         }
        
//         /* Component Refinements */
//         .container {
//           padding: 1rem;
//           max-width: 1400px;
//         }

//         .card {
//           border-radius: 1.5rem;
//           box-shadow: 0 10px 30px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.03);
//           background: var(--card-gradient);
//           border: none !important;
//         }

//         .card-header, .card-footer {
//           border-radius: 1.5rem 1.5rem 0 0;
//         }

//         .card-footer {
//           border-radius: 0 0 1.5rem 1.5rem;
//         }

//         /* Buttons */
//         .btn {
//           border-radius: 1rem;
//           padding: 0.75rem 1.5rem;
//         }

//         .btn-outline-primary {
//           border-color: #e0e7ff;
//           color: var(--primary-color);
//         }

//         .btn-outline-primary:hover {
//           background-color: #eef2ff;
//           color: var(--primary-color);
//           transform: translateY(-2px);
//         }

//         .btn-success {
//           background-color: var(--success-color);
//           border-color: var(--success-color);
//           transition: all 0.2s ease;
//         }

//         .btn-success:hover {
//           background-color: #047857;
//           border-color: #047857;
//           transform: translateY(-2px);
//         }

//         /* Forms and Inputs */
//         .form-control, .input-group-text, .form-select {
//           border-radius: 0.75rem;
//           border-color: #e5e7eb;
//           transition: all 0.2s ease;
//         }

//         .form-control:focus, .form-select:focus {
//           border-color: var(--primary-color);
//           box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
//         }

//         .input-group-text {
//           background-color: #f9fafb;
//           border-right: none;
//         }
        
//         /* Custom Select Component */
//         .select__control {
//           border-radius: 0.75rem !important;
//           border-color: #e5e7eb !important;
//           transition: all 0.2s ease;
//         }

//         .select__control--is-focused {
//           border-color: var(--primary-color) !important;
//           box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
//         }

//         .select__option--is-selected {
//           background-color: var(--primary-color) !important;
//           color: white !important;
//         }

//         .select__option--is-focused {
//           background-color: #f3f4f6 !important;
//         }

//         /* Item Row - Single Line Layout */
//         .item-row {
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           box-shadow: 0 2px 5px rgba(0,0,0,0.03);
//           display: grid;
//           grid-template-columns: 2fr 1fr 1fr 0.5fr; /* Adjusted proportions */
//           gap: 1rem;
//           align-items: center;
//         }
        
//         .item-row:hover {
//           transform: translateY(-3px);
//           box-shadow: 0 12px 30px rgba(0,0,0,0.08);
//           border-color: #c7d2fe !important;
//         }
        
//         .modal-content {
//           border-radius: 1.5rem;
//         }

//         .badge {
//           border-radius: 1rem;
//           padding: 0.5rem 1rem;
//           font-weight: 600;
//         }

//         .alert {
//           border-radius: 1rem;
//         }

//         /* Responsive Adjustments */
//         @media (max-width: 768px) {
//           .item-row {
//             grid-template-columns: 1fr; /* Stack on mobile */
//             gap: 0.5rem;
//           }
//           .item-row div {
//             width: 100% !important;
//             margin-bottom: 0.5rem;
//           }
//           .item-row .flex {
//             justify-content: flex-start;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default PricingAndServices;

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";
import {
  X,
  MoreVertical,
  PlusCircle,
  Search,
  Settings,
  Zap,
  TrendingDown,
} from "lucide-react";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";
import { Modal } from "react-bootstrap";

// Comprehensive currency list
const currencyOptions = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr" },
];

const pricingOptions = [
  { value: "fixed", label: "Fixed price", icon: "💎" },
  { value: "approximate", label: "Approximate price", icon: "🔮" },
  { value: "open", label: "Open account", icon: "📊" },
  { value: "open_max", label: "Open account with max price", icon: "💰" },
];

const vatOptions = [
  { value: "inclusive", label: "VAT Inclusive", badge: "primary" },
  { value: "exclusive", label: "VAT Exclusive", badge: "secondary" },
  { value: "none", label: "No VAT", badge: "outline-secondary" },
  { value: "reverse", label: "Reverse Charge", badge: "success" },
];

// VAT Rate dropdown options
const vatRateOptions = [
  { value: 10, label: "10%" },
  { value: 20, label: "20%" },
  { value: 25, label: "25%" },
  { value: 35, label: "35%" },
  { value: 50, label: "50%" },
];

const rutOptions = [
  { value: "apply", label: "Apply RUT Discount", badge: "success" },
  { value: "none", label: "No RUT Discount", badge: "secondary" },
];

const rotOptions = [
  { value: "apply", label: "Apply ROT Discount", badge: "success" },
  { value: "none", label: "No ROT Discount", badge: "secondary" },
];

const envTaxOptions = [
  { value: "exclusive", label: "Env Tax Exclusive", badge: "warning" },
  { value: "inclusive", label: "Env Tax Inclusive", badge: "info" },
  { value: "none", label: "No Env Tax", badge: "secondary" },
];

const PricingAndServices = ({ blockId, parentId, isPreview }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const [title, setTitle] = useState("Scope of Work");
  const [packageName, setPackageName] = useState("Product/service");
  const [currency, setCurrency] = useState(
    currencyOptions.find((opt) => opt.value === "SEK")
  );
  const [packageDescription, setPackageDescription] = useState(
    "Comprehensive service package designed to meet your business needs"
  );
  const [items, setItems] = useState([
    {
      name: "Consultation Service",
      price: 1000,
      description: "Initial consultation and planning",
      quantity: 1,
      vatRate: 20,
      vatType: "exclusive",
      rutDiscount: 0,
      rutType: "apply",
      rotDiscount: 0,
      rotType: "apply",
      envTaxRate: 0,
      envType: "exclusive",
    },
  ]);
  const [globalVatRate, setGlobalVatRate] = useState(20);
  const [globalVatType, setGlobalVatType] = useState("exclusive");
  const [globalRutDiscount, setGlobalRutDiscount] = useState(0);
  const [globalRutType, setGlobalRutType] = useState("apply");
  const [globalRotDiscount, setGlobalRotDiscount] = useState(0);
  const [globalRotType, setGlobalRotType] = useState("apply");
  const [globalEnvTaxRate, setGlobalEnvTaxRate] = useState(0);
  const [globalEnvType, setGlobalEnvType] = useState("exclusive");

  const [showModal, setShowModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");

  // Refs for tracking changes
  const lastSaveDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const hasUnsavedChangesRef = useRef(false);

  // Get current data state
  const getCurrentData = useCallback(() => {
    const itemTotals = items.map(calculateItemTotals);
    const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
    const vatTotal = itemTotals.reduce((sum, item) => sum + item.vatAmount, 0);
    const rutDiscountTotal = itemTotals.reduce(
      (sum, item) => sum + item.rutDiscountAmount,
      0
    );
    const rotDiscountTotal = itemTotals.reduce(
      (sum, item) => sum + item.rotDiscountAmount,
      0
    );
    const envTaxTotal = itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0);
    const rounding = 0;
    const total = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

    return {
      blockId,
      userId,
      parentId,
      title,
      packageName,
      packageDescription,
      currency: currency.value,
      netTotal,
      vat: vatTotal,
      rutDiscount: rutDiscountTotal,
      rotDiscount: rotDiscountTotal,
      envTax: envTaxTotal,
      rounding,
      total,
      items: items.map((item, index) => ({
        ...item,
        ...itemTotals[index],
      })),
      globalVatRate,
      globalVatType,
      globalRutDiscount,
      globalRutType,
      globalRotDiscount,
      globalRotType,
      globalEnvTaxRate,
      globalEnvType,
    };
  }, [
    blockId,
    userId,
    parentId,
    title,
    packageName,
    packageDescription,
    currency,
    items,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
  ]);

  // Enhanced calculation with RUT, ROT, Environment Tax
  const calculateItemTotals = (item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const vatRate = parseFloat(item.vatRate) || 0;
    const rutDiscount = parseFloat(item.rutDiscount) || 0;
    const rotDiscount = parseFloat(item.rotDiscount) || 0;
    const envTaxRate = parseFloat(item.envTaxRate) || 0;

    let subtotal = price * quantity;
    let rutDiscountAmount = 0;
    let rotDiscountAmount = 0;
    let vatAmount = 0;
    let envTaxAmount = 0;
    let total = subtotal;

    // Apply RUT discount
    if (item.rutType === "apply" && rutDiscount > 0) {
      rutDiscountAmount = subtotal * (rutDiscount / 100);
      total -= rutDiscountAmount;
    }

    // Apply ROT discount
    if (item.rotType === "apply" && rotDiscount > 0) {
      rotDiscountAmount = subtotal * (rotDiscount / 100);
      total -= rotDiscountAmount;
    }

    // Calculate VAT based on type
    if ((item.vatType === "exclusive" || item.vatType === "inclusive") && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
      if (item.vatType !== "reverse") {
        total += vatAmount;
      }
    } else if (item.vatType === "reverse" && vatRate > 0) {
      vatAmount = total * (vatRate / 100);
    }

    // Apply Environment Tax
    let envBase = total;
    if (item.envType === "none") {
      envTaxAmount = 0;
    } else if (item.envType === "exclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    } else if (item.envType === "inclusive" && envTaxRate > 0) {
      envTaxAmount = envBase * (envTaxRate / 100);
      total += envTaxAmount;
    }

    return {
      subtotal,
      rutDiscountAmount,
      rotDiscountAmount,
      vatAmount,
      envTaxAmount,
      total: item.vatType === "reverse" ? total - vatAmount : total,
    };
  };

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (isSaving) return;

    const currentData = getCurrentData();
    
    // Skip if no changes
    if (JSON.stringify(currentData) === JSON.stringify(lastSaveDataRef.current)) {
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      await dispatch(createPricingBlock(currentData)).unwrap();
      lastSaveDataRef.current = currentData;
      setLastSaveTime(new Date());
      setSaveStatus("saved");
      
      // Show saved notification briefly
      setTimeout(() => {
        if (saveStatus === "saved") {
          setSaveStatus("saved");
        }
      }, 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, getCurrentData, isSaving, saveStatus]);

  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a timeout for auto-save (1.5 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    title,
    packageName,
    packageDescription,
    currency,
    items,
    globalVatRate,
    globalVatType,
    globalRutDiscount,
    globalRutType,
    globalRotDiscount,
    globalRotType,
    globalEnvTaxRate,
    globalEnvType,
  ]);

  // Initialize last saved data on mount
  useEffect(() => {
    lastSaveDataRef.current = getCurrentData();
  }, []);

  // ---- Handlers ----
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: "",
        price: "",
        description: "",
        quantity: 1,
        vatRate: globalVatRate,
        vatType: globalVatType,
        rutDiscount: globalRutDiscount,
        rutType: globalRutType,
        rotDiscount: globalRotDiscount,
        rotType: globalRotType,
        envTaxRate: globalEnvTaxRate,
        envType: globalEnvType,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSettings = (index) => {
    setCurrentItemIndex(index);
    setShowModal(true);
  };

  const handleSaveSettings = () => {
    setShowModal(false);
  };

  // ---- Totals ----
  const itemTotals = items.map(calculateItemTotals);

  const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const vatTotal = itemTotals.reduce((sum, item) => sum + item.vatAmount, 0);
  const rutDiscountTotal = itemTotals.reduce(
    (sum, item) => sum + item.rutDiscountAmount,
    0
  );
  const rotDiscountTotal = itemTotals.reduce(
    (sum, item) => sum + item.rotDiscountAmount,
    0
  );
  const envTaxTotal = itemTotals.reduce((sum, item) => sum + item.envTaxAmount, 0);
  const rounding = 0;
  const total = netTotal + vatTotal + envTaxTotal + rounding - rutDiscountTotal - rotDiscountTotal;

  // Manual save trigger (optional, can be removed)
  const handleManualSave = () => {
    autoSave();
  };

  // Custom styles for modern look
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? "2px solid #6366f1" : "1px solid #e2e8f0",
      borderRadius: "12px",
      minWidth: "140px",
      fontSize: "0.875rem",
      backgroundColor: "white",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.1)" : "none",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: state.isFocused ? "#6366f1" : "#cbd5e1",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      maxHeight: "300px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      padding: "12px 16px",
      backgroundColor: state.isSelected
        ? "#6366f1"
        : state.isFocused
          ? "#f8fafc"
          : "white",
      color: state.isSelected ? "white" : "inherit",
      "&:active": {
        backgroundColor: state.isSelected ? "#6366f1" : "#f1f5f9",
      },
    }),
  };

  const getVatBadgeVariant = (vatType) => {
    const option = vatOptions.find((opt) => opt.value === vatType);
    return option?.badge || "secondary";
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Spinner animation="border" size="sm" className="me-1" />;
      case "saved":
        return "✓";
      case "error":
        return "⚠";
      default:
        return "";
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return lastSaveTime ? `Saved ${lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Saved";
      case "error":
        return "Save failed";
      default:
        return "";
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case "saving":
        return "text-warning";
      case "saved":
        return "text-success";
      case "error":
        return "text-danger";
      default:
        return "text-muted";
    }
  };

  return (
    <div
      className="container p-6 bg-white shadow-xl border border-gray-200"
      style={{ maxWidth: "1700px" }}
    >
      {/* Header Section with Auto-save Status */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <Form.Control
            type="text"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            className="text-5xl font-bold border-0 bg-transparent text-gray-900 p-0 focus:ring-0"
            style={{ outline: "none", boxShadow: "none" }}
            readOnly={isPreview}
          />
        </div>
        <div className={`flex items-center gap-2 text-sm ${getSaveStatusColor()}`}>
          <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
        </div>
      </div>

      {/* Main Card */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white">
        <Card.Header className="bg-linear-to-r from-blue-50 to-indigo-50 border-0 py-4 px-6">
          <div className="flex justify-between items-center flex-wrap gap-y-4">
            {/* Left Side: Icon + Label */}
            <div className="flex items-center gap-3 shrink min-w-0">
              <Zap size={20} className="text-indigo-600 shrink-0" />
              <span className="fw-semibold text-gray-700 whitespace-nowrap">
                Single option package
              </span>
            </div>

            {/* Right Side: Settings Dropdown + Currency Selector */}
            <div className="flex items-center gap-4">
              {/* Settings Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="div"
                  className="btn p-3 rounded-2xl border-0 bg-white shadow-sm hover:shadow-md transition-all"
                  style={{ cursor: "pointer" }}
                >
                  <Settings size={20} className="text-gray-600" />
                </Dropdown.Toggle>

                <Dropdown.Menu className="rounded-2xl shadow-lg border-0 p-3 min-w-80">
                  <Dropdown.Header className="fw-bold text-gray-700">
                    Block Settings
                  </Dropdown.Header>
                  <Dropdown.Item className="py-2">
                    Change package options
                  </Dropdown.Item>
                  <Dropdown.Item as="div" className="py-2">
                    <Form.Check
                      type="switch"
                      id="hide-summary"
                      label="Hide summary for block"
                      className="fw-normal"
                    />
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <div className="px-2 py-3 space-y-4">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        💸 Global VAT Rate
                      </Form.Label>
                      <Form.Select
                        value={globalVatRate}
                        onChange={(e) =>
                          setGlobalVatRate(parseFloat(e.target.value))
                        }
                        size="sm"
                        className="rounded-xl"
                      >
                        {vatRateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        📊 Global VAT Type
                      </Form.Label>
                      <Form.Select
                        value={globalVatType}
                        onChange={(e) => setGlobalVatType(e.target.value)}
                        size="sm"
                        className="rounded-xl"
                      >
                        {vatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        <TrendingDown size={14} className="me-1" />
                        RUT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={globalRutDiscount}
                        onChange={(e) =>
                          setGlobalRutDiscount(parseFloat(e.target.value))
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        size="sm"
                        className="rounded-xl"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        📊 Global RUT Type
                      </Form.Label>
                      <Form.Select
                        value={globalRutType}
                        onChange={(e) => setGlobalRutType(e.target.value)}
                        size="sm"
                        className="rounded-xl"
                      >
                        {rutOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        <TrendingDown size={14} className="me-1" />
                        ROT Discount (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={globalRotDiscount}
                        onChange={(e) =>
                          setGlobalRotDiscount(parseFloat(e.target.value))
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        size="sm"
                        className="rounded-xl"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        📊 Global ROT Type
                      </Form.Label>
                      <Form.Select
                        value={globalRotType}
                        onChange={(e) => setGlobalRotType(e.target.value)}
                        size="sm"
                        className="rounded-xl"
                      >
                        {rotOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        🌿 Environment Tax (%)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={globalEnvTaxRate}
                        onChange={(e) =>
                          setGlobalEnvTaxRate(parseFloat(e.target.value))
                        }
                        min="0"
                        step="0.1"
                        size="sm"
                        className="rounded-xl"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-gray-700">
                        📊 Global Env Tax Type
                      </Form.Label>
                      <Form.Select
                        value={globalEnvType}
                        onChange={(e) => setGlobalEnvType(e.target.value)}
                        size="sm"
                        className="rounded-xl"
                      >
                        {envTaxOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </Dropdown.Menu>
              </Dropdown>

              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Currency:</span>
                <Select
                  options={currencyOptions}
                  value={currency}
                  onChange={setCurrency}
                  className="currency-select"
                  classNamePrefix="select"
                  isSearchable
                  styles={customStyles}
                  placeholder="Search currency..."
                  components={{
                    DropdownIndicator: () => (
                      <Search size={16} className="text-gray-400 me-1" />
                    ),
                    IndicatorSeparator: () => null,
                  }}
                />
              </div>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-6">
          {/* Package Header */}
          <div className="mb-6">
            <Form.Control
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="text-2xl fw-bold border-0 bg-transparent px-0 mb-3 text-gray-900"
              style={{ outline: "none", boxShadow: "none" }}
            />

            <EditableQuill
              id="packageDescription"
              value={packageDescription}
              onChange={setPackageDescription}
              className="text-gray-600 border-0 px-0 bg-transparent fs-6"
              minRows={2}
            />
          </div>

          {/* Items List - Single Line Layout */}
          {items.map((item, index) => (
            <div
              key={index}
              className="item-row mb-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-blue-50/30 transition-all overflow-hidden"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}
            >
              {/* Product Name */}
              <div className="w-full">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 ps-3 rounded-s-xl">
                    <Settings size={16} className="text-gray-400" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Product / Service name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    className="rounded-e-2xl border-start-0"
                  />
                </InputGroup>
              </div>

              {/* Price */}
              <div className="w-full">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <span className="fw-bold text-gray-600">
                      {currency.symbol || currency.value}
                    </span>
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="0.00"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                    min="0"
                    step="0.01"
                    className="border-start-0 rounded-e-2xl"
                  />
                </InputGroup>
              </div>

              {/* VAT Badge */}
              <div className="w-full text-center">
                <Badge
                  bg={getVatBadgeVariant(item.vatType)}
                  className="w-full justify-center py-2 rounded-xl"
                >
                  {item.vatType === "reverse" ? "🔄 Reverse" : `VAT ${item.vatRate}%`}
                </Badge>
              </div>

              {/* Actions */}
              <div className="w-full flex justify-end gap-2">
                <Button
                  variant="outline-primary"
                  className="rounded-xl border-0 bg-white shadow-sm hover:shadow-md"
                  onClick={() => handleProductSettings(index)}
                  title="Product settings"
                >
                  <Settings size={16} />
                </Button>
                <Button
                  variant="outline-danger"
                  className="rounded-xl border-0 bg-white shadow-sm hover:shadow-md"
                  onClick={() => handleRemoveItem(index)}
                  title="Remove item"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-2 mt-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={handleAddItem}
          >
            <PlusCircle size={20} />
            Add Product / Service
          </Button>
        </Card.Body>

        {/* Footer Totals - Removed Save Button */}
        <Card.Footer className="bg-gray-50 border-0 py-6 px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 min-w-80 flex-1">
              <h6 className="fw-bold text-gray-700 mb-4 flex items-center gap-2">
                💰 Payment Summary
                {isSaving && (
                  <span className="text-warning text-sm fw-normal flex items-center gap-1">
                    <Spinner animation="border" size="sm" />
                    Saving...
                  </span>
                )}
              </h6>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Net total</span>
                  <span className="fw-semibold">
                    {currency.symbol || currency.value} {netTotal.toFixed(2)}
                  </span>
                </div>

                {rutDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-success">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={14} />
                      RUT Discount
                    </span>
                    <span className="fw-semibold">
                      -{currency.symbol || currency.value}{" "}
                      {rutDiscountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {rotDiscountTotal > 0 && (
                  <div className="flex justify-between items-center text-success">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={14} />
                      ROT Discount
                    </span>
                    <span className="fw-semibold">
                      -{currency.symbol || currency.value}{" "}
                      {rotDiscountTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {vatTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">VAT ({globalVatRate}%)</span>
                    <span className="fw-semibold">
                      {currency.symbol || currency.value} {vatTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {envTaxTotal > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Environment Tax ({globalEnvTaxRate}%)</span>
                    <span className="fw-semibold">
                      {currency.symbol || currency.value} {envTaxTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rounding</span>
                  <span className="fw-semibold">
                    {currency.symbol || currency.value} {rounding.toFixed(2)}
                  </span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between items-center fw-bold fs-5">
                  <span>Total Amount</span>
                  <span className="text-success">
                    {currency.symbol || currency.value} {total.toFixed(2)}
                  </span>
                </div>

                {items.some((item) => item.vatType === "reverse") && (
                  <Alert variant="info" className="mt-3 small rounded-xl">
                    <strong>Reverse Charge Applied:</strong> VAT to be paid
                    directly to tax authority
                  </Alert>
                )}
              </div>
            </div>

            {/* Save Status Indicator */}
            <div className="flex flex-col items-end gap-2">
              <div className={`text-sm ${getSaveStatusColor()}`}>
                <span className="fw-medium">{getSaveStatusIcon()} {getSaveStatusText()}</span>
              </div>
              {saveStatus === "error" && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleManualSave}
                  className="rounded-xl"
                >
                  Retry Save
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Settings Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">⚙️ Product Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {items[currentItemIndex] && (
            <Form>
              <div className="row g-4">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Product Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={items[currentItemIndex].name}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter product name"
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={items[currentItemIndex].quantity}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-12">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={items[currentItemIndex].description}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Product description"
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Price</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="rounded-s-xl">
                        {currency.symbol || currency.value}
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={items[currentItemIndex].price}
                        onChange={(e) =>
                          handleItemChange(
                            currentItemIndex,
                            "price",
                            e.target.value
                          )
                        }
                        className="rounded-e-xl"
                      />
                    </InputGroup>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      VAT Rate
                    </Form.Label>
                    <Form.Select
                      value={items[currentItemIndex].vatRate}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "vatRate",
                          parseFloat(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    >
                      {vatRateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Environment Tax (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.1"
                      value={items[currentItemIndex].envTaxRate}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "envTaxRate",
                          parseFloat(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold flex items-center gap-1">
                      <TrendingDown size={14} className="me-1" />
                      RUT Discount (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={items[currentItemIndex].rutDiscount}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "rutDiscount",
                          parseFloat(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold flex items-center gap-1">
                      <TrendingDown size={14} className="me-1" />
                      ROT Discount (%)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={items[currentItemIndex].rotDiscount}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "rotDiscount",
                          parseFloat(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">VAT Type</Form.Label>
                    <Form.Select
                      value={items[currentItemIndex].vatType}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "vatType",
                          e.target.value
                        )
                      }
                      className="rounded-xl"
                    >
                      {vatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">RUT Type</Form.Label>
                    <Form.Select
                      value={items[currentItemIndex].rutType}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "rutType",
                          e.target.value
                        )
                      }
                      className="rounded-xl"
                    >
                      {rutOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">ROT Type</Form.Label>
                    <Form.Select
                      value={items[currentItemIndex].rotType}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "rotType",
                          e.target.value
                        )
                      }
                      className="rounded-xl"
                    >
                      {rotOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="fw-semibold">Env Tax Type</Form.Label>
                    <Form.Select
                      value={items[currentItemIndex].envType}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "envType",
                          e.target.value
                        )
                      }
                      className="rounded-xl"
                    >
                      {envTaxOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Calculation Preview */}
                <div className="col-12">
                  <div className="bg-linear-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
                    <h6 className="fw-bold mb-3">📊 Calculation Preview</h6>
                    <div className="row small text-gray-700">
                      <div className="col-md-3 mb-2">
                        <div>Subtotal:</div>
                        <div className="fw-semibold">
                          {currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).subtotal.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div>RUT Discount:</div>
                        <div className="fw-semibold text-success">
                          -{currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).rutDiscountAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div>ROT Discount:</div>
                        <div className="fw-semibold text-success">
                          -{currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).rotDiscountAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div>Environment Tax:</div>
                        <div className="fw-semibold text-warning">
                          {currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).envTaxAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div>VAT ({items[currentItemIndex].vatRate}%):</div>
                        <div className="fw-semibold">
                          {currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).vatAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-3 mb-2">
                        <div>Total:</div>
                        <div className="fw-bold fs-6 text-success">
                          {currency.symbol || currency.value}{" "}
                          {calculateItemTotals(
                            items[currentItemIndex]
                          ).total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            className="rounded-xl"
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        /* Modern typography */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body, .fw-normal {
          font-family: 'Inter', sans-serif;
        }
        
        .font-bold {
          font-weight: 700;
        }
        
        .fw-semibold {
          font-weight: 600;
        }

        /* Color Palette & Gradients */
        :root {
          --primary-color: #4f46e5; /* A vibrant indigo */
          --primary-light: #eef2ff; /* A soft background for the header */
          --secondary-color: #1f2937; /* Dark charcoal for text */
          --success-color: #059669; /* Deep green */
          --warning-color: #f59e0b; /* Warning color for Environment Tax */
          --background-gradient: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          --card-gradient: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
        }

        .bg-gradient-to-br {
          background: var(--background-gradient);
        }

        .from-blue-50 {
          background-color: var(--primary-light) !important;
        }

        .to-indigo-50 {
          background-color: var(--primary-light) !important;
        }

        .bg-gradient-to-r {
          background: linear-gradient(to right, #eef2ff, #e0e7ff) !important;
        }

        .bg-gray-50 {
          background-color: #f9fafb !important;
        }
        
        /* Component Refinements */
        .container {
          padding: 1rem;
          max-width: 1400px;
        }

        .card {
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.03);
          background: var(--card-gradient);
          border: none !important;
        }

        .card-header, .card-footer {
          border-radius: 1.5rem 1.5rem 0 0;
        }

        .card-footer {
          border-radius: 0 0 1.5rem 1.5rem;
        }

        /* Buttons */
        .btn {
          border-radius: 1rem;
          padding: 0.75rem 1.5rem;
        }

        .btn-outline-primary {
          border-color: #e0e7ff;
          color: var(--primary-color);
        }

        .btn-outline-primary:hover {
          background-color: #eef2ff;
          color: var(--primary-color);
          transform: translateY(-2px);
        }

        .btn-success {
          background-color: var(--success-color);
          border-color: var(--success-color);
          transition: all 0.2s ease;
        }

        .btn-success:hover {
          background-color: #047857;
          border-color: #047857;
          transform: translateY(-2px);
        }

        /* Forms and Inputs */
        .form-control, .input-group-text, .form-select {
          border-radius: 0.75rem;
          border-color: #e5e7eb;
          transition: all 0.2s ease;
        }

        .form-control:focus, .form-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .input-group-text {
          background-color: #f9fafb;
          border-right: none;
        }
        
        /* Custom Select Component */
        .select__control {
          border-radius: 0.75rem !important;
          border-color: #e5e7eb !important;
          transition: all 0.2s ease;
        }

        .select__control--is-focused {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
        }

        .select__option--is-selected {
          background-color: var(--primary-color) !important;
          color: white !important;
        }

        .select__option--is-focused {
          background-color: #f3f4f6 !important;
        }

        /* Item Row - Single Line Layout */
        .item-row {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 0.5fr; /* Adjusted proportions */
          gap: 1rem;
          align-items: center;
        }
        
        .item-row:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
          border-color: #c7d2fe !important;
        }
        
        .modal-content {
          border-radius: 1.5rem;
        }

        .badge {
          border-radius: 1rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }

        .alert {
          border-radius: 1rem;
        }

        /* Auto-save Status */
        .auto-save-status {
          transition: all 0.3s ease;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .item-row {
            grid-template-columns: 1fr; /* Stack on mobile */
            gap: 0.5rem;
          }
          .item-row div {
            width: 100% !important;
            margin-bottom: 0.5rem;
          }
          .item-row .flex {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices;