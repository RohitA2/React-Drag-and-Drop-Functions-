import React, { useState } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { X, MoreVertical, PlusCircle, Search } from "lucide-react";
import Select from "react-select";
import EditableQuill from "./HeaderBlocks/EditableQuill";
import { useDispatch, useSelector } from "react-redux";
import { createPricingBlock } from "../../store/pricingSlice";
import { selectedUserId } from "../../store/authSlice";
import { Modal } from "react-bootstrap";

// Comprehensive currency list
const currencyOptions = [
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "AFN", label: "AFN - Afghan Afghani" },
  { value: "ALL", label: "ALL - Albanian Lek" },
  { value: "AMD", label: "AMD - Armenian Dram" },
  { value: "ANG", label: "ANG - Netherlands Antillean Guilder" },
  { value: "AOA", label: "AOA - Angolan Kwanza" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "AWG", label: "AWG - Aruban Florin" },
  { value: "AZN", label: "AZN - Azerbaijani Manat" },
  { value: "BAM", label: "BAM - Bosnia-Herzegovina Convertible Mark" },
  { value: "BBD", label: "BBD - Barbadian Dollar" },
  { value: "BDT", label: "BDT - Bangladeshi Taka" },
  { value: "BGN", label: "BGN - Bulgarian Lev" },
  { value: "BHD", label: "BHD - Bahraini Dinar" },
  { value: "BIF", label: "BIF - Burundian Franc" },
  { value: "BMD", label: "BMD - Bermudian Dollar" },
  { value: "BND", label: "BND - Brunei Dollar" },
  { value: "BOB", label: "BOB - Bolivian Boliviano" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "BSD", label: "BSD - Bahamian Dollar" },
  { value: "BTN", label: "BTN - Bhutanese Ngultrum" },
  { value: "BWP", label: "BWP - Botswanan Pula" },
  { value: "BYN", label: "BYN - Belarusian Ruble" },
  { value: "BZD", label: "BZD - Belize Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CDF", label: "CDF - Congolese Franc" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CLP", label: "CLP - Chilean Peso" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "COP", label: "COP - Colombian Peso" },
  { value: "CRC", label: "CRC - Costa Rican Colón" },
  { value: "CUP", label: "CUP - Cuban Peso" },
  { value: "CVE", label: "CVE - Cape Verdean Escudo" },
  { value: "CZK", label: "CZK - Czech Koruna" },
  { value: "DJF", label: "DJF - Djiboutian Franc" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "DOP", label: "DOP - Dominican Peso" },
  { value: "DZD", label: "DZD - Algerian Dinar" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "ERN", label: "ERN - Eritrean Nakfa" },
  { value: "ETB", label: "ETB - Ethiopian Birr" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "FJD", label: "FJD - Fijian Dollar" },
  { value: "FKP", label: "FKP - Falkland Islands Pound" },
  { value: "FOK", label: "FOK - Faroese Króna" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "GEL", label: "GEL - Georgian Lari" },
  { value: "GGP", label: "GGP - Guernsey Pound" },
  { value: "GHS", label: "GHS - Ghanaian Cedi" },
  { value: "GIP", label: "GIP - Gibraltar Pound" },
  { value: "GMD", label: "GMD - Gambian Dalasi" },
  { value: "GNF", label: "GNF - Guinean Franc" },
  { value: "GTQ", label: "GTQ - Guatemalan Quetzal" },
  { value: "GYD", label: "GYD - Guyanaese Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "HNL", label: "HNL - Honduran Lempira" },
  { value: "HRK", label: "HRK - Croatian Kuna" },
  { value: "HTG", label: "HTG - Haitian Gourde" },
  { value: "HUF", label: "HUF - Hungarian Forint" },
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "ILS", label: "ILS - Israeli New Shekel" },
  { value: "IMP", label: "IMP - Isle of Man Pound" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "IQD", label: "IQD - Iraqi Dinar" },
  { value: "IRR", label: "IRR - Iranian Rial" },
  { value: "ISK", label: "ISK - Icelandic Króna" },
  { value: "JEP", label: "JEP - Jersey Pound" },
  { value: "JMD", label: "JMD - Jamaican Dollar" },
  { value: "JOD", label: "JOD - Jordanian Dinar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "KGS", label: "KGS - Kyrgyzstani Som" },
  { value: "KHR", label: "KHR - Cambodian Riel" },
  { value: "KID", label: "KID - Kiribati Dollar" },
  { value: "KMF", label: "KMF - Comorian Franc" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar" },
  { value: "KYD", label: "KYD - Cayman Islands Dollar" },
  { value: "KZT", label: "KZT - Kazakhstani Tenge" },
  { value: "LAK", label: "LAK - Lao Kip" },
  { value: "LBP", label: "LBP - Lebanese Pound" },
  { value: "LKR", label: "LKR - Sri Lankan Rupee" },
  { value: "LRD", label: "LRD - Liberian Dollar" },
  { value: "LSL", label: "LSL - Lesotho Loti" },
  { value: "LYD", label: "LYD - Libyan Dinar" },
  { value: "MAD", label: "MAD - Moroccan Dirham" },
  { value: "MDL", label: "MDL - Moldovan Leu" },
  { value: "MGA", label: "MGA - Malagasy Ariary" },
  { value: "MKD", label: "MKD - Macedonian Denar" },
  { value: "MMK", label: "MMK - Myanmar Kyat" },
  { value: "MNT", label: "MNT - Mongolian Tögrög" },
  { value: "MOP", label: "MOP - Macanese Pataca" },
  { value: "MRU", label: "MRU - Mauritanian Ouguiya" },
  { value: "MUR", label: "MUR - Mauritian Rupee" },
  { value: "MVR", label: "MVR - Maldivian Rufiyaa" },
  { value: "MWK", label: "MWK - Malawian Kwacha" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
  { value: "MZN", label: "MZN - Mozambican Metical" },
  { value: "NAD", label: "NAD - Namibian Dollar" },
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "NIO", label: "NIO - Nicaraguan Córdoba" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "NPR", label: "NPR - Nepalese Rupee" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "OMR", label: "OMR - Omani Rial" },
  { value: "PAB", label: "PAB - Panamanian Balboa" },
  { value: "PEN", label: "PEN - Peruvian Sol" },
  { value: "PGK", label: "PGK - Papua New Guinean Kina" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "PLN", label: "PLN - Polish Złoty" },
  { value: "PYG", label: "PYG - Paraguayan Guaraní" },
  { value: "QAR", label: "QAR - Qatari Riyal" },
  { value: "RON", label: "RON - Romanian Leu" },
  { value: "RSD", label: "RSD - Serbian Dinar" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "RWF", label: "RWF - Rwandan Franc" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "SBD", label: "SBD - Solomon Islands Dollar" },
  { value: "SCR", label: "SCR - Seychellois Rupee" },
  { value: "SDG", label: "SDG - Sudanese Pound" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "SHP", label: "SHP - Saint Helena Pound" },
  { value: "SLE", label: "SLE - Sierra Leonean Leone" },
  { value: "SLL", label: "SLL - Sierra Leonean Leone (old)" },
  { value: "SOS", label: "SOS - Somali Shilling" },
  { value: "SRD", label: "SRD - Surinamese Dollar" },
  { value: "SSP", label: "SSP - South Sudanese Pound" },
  { value: "STN", label: "STN - São Tomé and Príncipe Dobra" },
  { value: "SYP", label: "SYP - Syrian Pound" },
  { value: "SZL", label: "SZL - Swazi Lilangeni" },
  { value: "THB", label: "THB - Thai Baht" },
  { value: "TJS", label: "TJS - Tajikistani Somoni" },
  { value: "TMT", label: "TMT - Turkmenistani Manat" },
  { value: "TND", label: "TND - Tunisian Dinar" },
  { value: "TOP", label: "TOP - Tongan Paʻanga" },
  { value: "TRY", label: "TRY - Turkish Lira" },
  { value: "TTD", label: "TTD - Trinidad and Tobago Dollar" },
  { value: "TVD", label: "TVD - Tuvaluan Dollar" },
  { value: "TWD", label: "TWD - New Taiwan Dollar" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "UAH", label: "UAH - Ukrainian Hryvnia" },
  { value: "UGX", label: "UGX - Ugandan Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "UYU", label: "UYU - Uruguayan Peso" },
  { value: "UZS", label: "UZS - Uzbekistani So'm" },
  { value: "VES", label: "VES - Venezuelan Bolívar" },
  { value: "VND", label: "VND - Vietnamese Đồng" },
  { value: "VUV", label: "VUV - Vanuatu Vatu" },
  { value: "WST", label: "WST - Samoan Tālā" },
  { value: "XAF", label: "XAF - Central African CFA Franc" },
  { value: "XCD", label: "XCD - East Caribbean Dollar" },
  { value: "XDR", label: "XDR - Special Drawing Rights" },
  { value: "XOF", label: "XOF - West African CFA Franc" },
  { value: "XPF", label: "XPF - CFP Franc" },
  { value: "YER", label: "YER - Yemeni Rial" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "ZMW", label: "ZMW - Zambian Kwacha" },
  { value: "ZWL", label: "ZWL - Zimbabwean Dollar" },
];

const pricingOptions = [
  "Fixed price",
  "Approximate price",
  "Open account",
  "Open account with max price",
];

const vatOptions = [
  { value: "inclusive", label: "VAT Inclusive" },
  { value: "exclusive", label: "VAT Exclusive" },
  { value: "none", label: "No VAT" },
];

const PricingAndServices = ({ blockId, parentId }) => {
  const dispatch = useDispatch();
  const userId = useSelector(selectedUserId);
  const { loading } = useSelector((state) => state.pricing);

  const [title, setTitle] = useState("Scope of Work");
  const [packageName, setPackageName] = useState("Package name");
  const [currency, setCurrency] = useState(
    currencyOptions.find((opt) => opt.value === "USD")
  ); // Default: USD
  const [pricingType, setPricingType] = useState(pricingOptions[1]); // Approximate price
  const [showPricingDropdown, setShowPricingDropdown] = useState(false);
  const [packageDescription, setPackageDescription] = useState(
    "Package description"
  );
  const [items, setItems] = useState([
    {
      name: "Sample product",
      price: 1000,
      description: "",
      quantity: 1,
      tax: 0,
      vatType: "exclusive",
    },
  ]);
  const [globalVatRate, setGlobalVatRate] = useState(20); // Default VAT rate
  const [globalVatType, setGlobalVatType] = useState("exclusive"); // Default VAT type

  const [showModal, setShowModal] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  console.log("i am from pricing block ids", blockId, parentId);

  // ---- Handlers ----
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: "",
        price: "",
        description: "",
        quantity: 1,
        tax: 0,
        vatType: globalVatType,
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

  // Open settings modal
  const handleProductSettings = (index) => {
    setCurrentItemIndex(index);
    setShowModal(true);
  };

  // Save settings from modal
  const handleSaveSettings = () => {
    setShowModal(false);
  };

  // Calculate item totals with VAT
  const calculateItemTotals = (item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const taxRate = parseFloat(item.tax) || 0;

    const subtotal = price * quantity;
    let taxAmount = 0;
    let total = subtotal;

    if (item.vatType === "exclusive" && taxRate > 0) {
      taxAmount = subtotal * (taxRate / 100);
      total = subtotal + taxAmount;
    } else if (item.vatType === "inclusive" && taxRate > 0) {
      // Calculate tax amount for inclusive VAT
      taxAmount = subtotal - subtotal / (1 + taxRate / 100);
      total = subtotal;
    }

    return { subtotal, taxAmount, total };
  };

  // ---- Totals ----
  const itemTotals = items.map(calculateItemTotals);

  const netTotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const vatTotal = itemTotals.reduce((sum, item) => sum + item.taxAmount, 0);
  const rounding = 0;
  const total = netTotal + vatTotal + rounding;

  // ---- Save ----
  const handleSaveBlock = () => {
    dispatch(
      createPricingBlock({
        blockId,
        userId,
        parentId,
        title,
        packageName,
        packageDescription,
        currency: currency.value,
        pricingType,
        netTotal,
        vat: vatTotal,
        rounding,
        total,
        items: items.map((item, index) => ({
          ...item,
          ...itemTotals[index],
        })),
        globalVatRate,
        globalVatType,
      })
    );
  };

  // Gear icon SVG
  const GearIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      <path d="M8.932 0.727c-.243-.244-.64-.244-.884 0l-.642.642a.5.5 0 0 1-.707 0l-.643-.643c-.243-.243-.64-.243-.884 0-.243.244-.243.64 0 .884l.643.643a.5.5 0 0 1 0 .707l-.643.643c-.243.243-.243.64 0 .884.244.243.64.243.884 0l.643-.643a.5.5 0 0 1 .707 0l.643.643c.243.243.64.243.884 0 .243-.244.243-.64 0-.884l-.643-.643a.5.5 0 0 1 0-.707l.643-.643c.243-.244.243-.64 0-.884zM6.588 2.427l.643.643a1.5 1.5 0 0 0 2.122 0l.643-.643c.487-.487.487-1.279 0-1.766s-1.279-.487-1.766 0l-.643.643a1.5 1.5 0 0 0-2.122 0l-.643.643c-.487.487-.487 1.279 0 1.766s1.279.487 1.766 0z" />
    </svg>
  );

  // X icon SVG
  const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  );

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      border: 0,
      minWidth: "120px",
      fontSize: "0.875rem",
      backgroundColor: "transparent",
      boxShadow: "none",
      "&:hover": {
        border: 0,
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      maxHeight: "300px",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#f8f9fa"
        : "white",
      color: state.isSelected ? "white" : "inherit",
    }),
  };

  return (
    <div
      className="container p-4 bg-white shadow"
      style={{ maxWidth: "1800px" }}
    >
      {/* Editable Title */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="fs-2 fw-bold border-0 bg-transparent text-black"
          style={{ outline: "none", boxShadow: "none", flex: 1 }}
        />

        {/* Dropdown (3 dots) */}
        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="btn btn-link p-0 border-0"
            style={{ cursor: "pointer" }}
          >
            <MoreVertical size={20} className="text-muted" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Change package options</Dropdown.Item>
            <Dropdown.Item as="div">
              <Form.Check
                type="switch"
                id="hide-summary"
                label="Hide summary for block"
              />
            </Dropdown.Item>
            <Dropdown.Divider />
            <div className="px-3 py-2">
              <Form.Group>
                <Form.Label className="small">Global VAT Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={globalVatRate}
                  onChange={(e) => setGlobalVatRate(parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                  size="sm"
                />
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label className="small">Global VAT Type</Form.Label>
                <Form.Select
                  value={globalVatType}
                  onChange={(e) => setGlobalVatType(e.target.value)}
                  size="sm"
                >
                  <option value="exclusive">VAT Exclusive</option>
                  <option value="inclusive">VAT Inclusive</option>
                  <option value="none">No VAT</option>
                </Form.Select>
              </Form.Group>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Main Card */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3 px-4 border-0">
          <span className="fw-semibold text-secondary">Single option</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Currency:</span>
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
                  <Search size={14} className="text-muted me-1" />
                ),
                IndicatorSeparator: () => null,
              }}
            />
          </div>
        </Card.Header>

        <Card.Body className="px-4">
          {/* Package Name */}
          <Form.Control
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            className="fs-5 fw-semibold border-0 bg-transparent px-0 mb-2"
            style={{ outline: "none", boxShadow: "none" }}
          />

          {/* Package Description */}
          <EditableQuill
            id="packageDescription"
            value={packageDescription}
            onChange={setPackageDescription}
            className="text-muted border-0 px-0 mb-4 bg-transparent fs-6 fw-semibold"
            minRows={2}
          />

          {/* Pricing Type */}
          <div className="d-flex justify-content-end position-relative mb-2">
            <div
              className="border rounded px-2 py-1 bg-light text-muted small fw-semibold"
              style={{ cursor: "pointer", minWidth: "200px" }}
              onClick={() => setShowPricingDropdown(!showPricingDropdown)}
            >
              Pricing: <span className="text-primary">{pricingType}</span>
            </div>

            {showPricingDropdown && (
              <div className="pricing-dropdown-menu">
                {pricingOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setPricingType(option);
                      setShowPricingDropdown(false);
                    }}
                    className={`px-3 py-2 small ${
                      pricingType === option
                        ? "bg-primary text-white"
                        : "text-muted bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.map((item, index) => (
            <div className="item-row mb-3 position-relative" key={index}>
              <InputGroup className="hover-reveal-controls">
                {/* Product input with built-in icon */}
                <InputGroup.Text className="bg-transparent border-end-0 ps-3">
                  <span className="text-muted">
                    <GearIcon />
                  </span>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Product / Service"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="border-start-0"
                />

                {/* Settings button */}
                <Button
                  variant="outline-secondary"
                  className="border-start-0 settings-btn"
                  onClick={() => handleProductSettings(index)}
                  title="Product settings"
                >
                  <GearIcon />
                </Button>

                {/* Price input with built-in currency icon */}
                <InputGroup.Text className="bg-transparent border-end-0">
                  <span className="fw-bold text-muted">{currency.value}</span>
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="0.00"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                  min="0"
                  step="0.01"
                  className="border-start-0"
                />

                {/* Remove button */}
                <Button
                  variant="outline-danger"
                  className="remove-btn"
                  onClick={() => handleRemoveItem(index)}
                  title="Remove item"
                >
                  <XIcon />
                </Button>
              </InputGroup>
            </div>
          ))}

          {/* Add item button */}
          <Button
            variant="outline-primary"
            className="d-flex align-items-center gap-2 mt-2"
            onClick={handleAddItem}
          >
            <PlusCircle size={18} />
            Add Product / Service
          </Button>
        </Card.Body>

        {/* Footer Totals */}
        <Card.Footer className="bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div
              className="p-3 rounded-3 shadow-sm bg-light"
              style={{ minWidth: "260px" }}
            >
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Net total</span>
                <span>
                  {currency.value} {netTotal.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">VAT ({globalVatRate}%)</span>
                <span>
                  {currency.value} {vatTotal.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Rounding</span>
                <span>
                  {currency.value} {rounding.toFixed(2)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold fs-6">
                <span>Total incl. VAT</span>
                <span className="text-success">
                  {currency.value} {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="success"
              onClick={handleSaveBlock}
              disabled={loading}
              className="ms-3"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save "
              )}
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* Settings Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Product Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={items[currentItemIndex]?.name || ""}
                onChange={(e) =>
                  handleItemChange(currentItemIndex, "name", e.target.value)
                }
                placeholder="Product name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={items[currentItemIndex]?.description || ""}
                onChange={(e) =>
                  handleItemChange(
                    currentItemIndex,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Product description"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>{currency.value}</InputGroup.Text>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={items[currentItemIndex]?.price || 0}
                      onChange={(e) =>
                        handleItemChange(
                          currentItemIndex,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={items[currentItemIndex]?.quantity || 1}
                    onChange={(e) =>
                      handleItemChange(
                        currentItemIndex,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Tax Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    value={items[currentItemIndex]?.tax || globalVatRate}
                    onChange={(e) =>
                      handleItemChange(
                        currentItemIndex,
                        "tax",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>VAT Type</Form.Label>
              <Form.Select
                value={items[currentItemIndex]?.vatType || globalVatType}
                onChange={(e) =>
                  handleItemChange(currentItemIndex, "vatType", e.target.value)
                }
              >
                <option value="exclusive">VAT Exclusive</option>
                <option value="inclusive">VAT Inclusive</option>
                <option value="none">No VAT</option>
              </Form.Select>
            </Form.Group>

            {/* Calculation Preview */}
            {items[currentItemIndex] && (
              <div className="p-3 bg-light rounded">
                <h6 className="mb-2">Calculation Preview</h6>
                <div className="d-flex justify-content-between small">
                  <span>Subtotal:</span>
                  <span>
                    {currency.value}{" "}
                    {calculateItemTotals(
                      items[currentItemIndex]
                    ).subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>Tax ({items[currentItemIndex].tax}%):</span>
                  <span>
                    {currency.value}{" "}
                    {calculateItemTotals(
                      items[currentItemIndex]
                    ).taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>
                    {currency.value}{" "}
                    {calculateItemTotals(items[currentItemIndex]).total.toFixed(
                      2
                    )}
                  </span>
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .pricing-dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
          z-index: 1000;
          min-width: 220px;
        }
        .hover-reveal-controls {
          transition: all 0.3s ease;
        }
        
        .settings-btn, .remove-btn {
         
          opacity: 0.6;
          transition: all 0.3s ease;
        }
        
        .item-row:hover .settings-btn,
        .item-row:hover .remove-btn {
          opacity: 1;
        }
        
        .item-row:hover {
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .settings-btn:hover, .remove-btn:hover {
          transform: scale(1.1);
        }
        
        .bg-transparent {
          background-color: transparent !important;
        }
        
        @media (max-width: 768px) {
          .settings-btn, .remove-btn {
            opacity: 1;
          }
        }
        
        .currency-select .select__control {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default PricingAndServices;
