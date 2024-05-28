//////////////////////////////////////////////////
// NPM packages
//////////////////////////////////////////////////
const express = require("express");
const {
  body,
  param,
  query,
  cookie,
  header,
  validationResult,
} = require("express-validator");
const createError = require("http-errors");
const moment = require("moment");
const router = express.Router();
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////
const getDate = () => {
  // 2022-09-05
  return moment().format("YYYY-MM-DD");
};

const removeWhitespaceOfAString = (str) => {
  // Java   Script => JavaScript
  return str.split(/\s+/).join("");
};

const replaceMultipleWhitespaceWithSingleWhiteSpace = (str) => {
  // Git    Graph => Git Graph
  return str.replace(/\s\s+/g, " ");
};

const aadhaarNumberFormat = (str) => {
  return str.replace(/(\d{4})(?=\d)/g, "$1 ");
};
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// Act as ENV value
//////////////////////////////////////////////////
const PASSPORT_EXPIRY_DATE_EXCEPT_AFTER = "2025-02-28";
const VACCINE_TYPES = ["SINGLE_DOSE", "DOUBLE_DOSE", "BOOSTER_DOSE", "NONE"];
const MEAL_TYPES = ["VEG", "NON_VEG", "JAIN"];
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// Middlewares
//////////////////////////////////////////////////
const passportDataValidationRules = () => {
  return [
    param("application_id")
      .isInt()
      .withMessage("Application ID: Must be a number"),
    body("modified_given_name")
      .notEmpty()
      .withMessage("Given Name: Required")
      .trim()
      .isAlpha()
      .withMessage("Given Name: Letters only")
      .toUpperCase(),
    body("modified_surname")
      .notEmpty()
      .withMessage("Surname: Required")
      .trim()
      .isAlpha()
      .withMessage("Surname: Letters only")
      .toUpperCase(),
    body("modified_passport_number")
      .notEmpty()
      .withMessage("Passport number: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isLength({ min: 8, max: 8 })
      .withMessage("Passport number: Must be 8 characters long")
      .isAlphanumeric()
      .withMessage("Passport number: Letters and numbers only")
      .matches(/^[a-zA-Z]/)
      .withMessage("Passport number: The first character must be a letter.")
      .toUpperCase(),
    body("modified_date_of_birth")
      .notEmpty()
      .withMessage("Date of birth: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isDate()
      .withMessage("Date of birth: Invalid date")
      .isBefore(getDate())
      .withMessage("Date of birth: Must be before today"),
    body("modified_nationality")
      .notEmpty()
      .withMessage("Nationality: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isAlpha()
      .withMessage("Nationality: Letters only")
      .toUpperCase(),
    body("modified_country_code")
      .notEmpty()
      .withMessage("Country code: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isAlpha()
      .withMessage("Country code: Letters only")
      .isLength({ min: 3, max: 3 })
      .withMessage("Country code: Must be 3 characters long")
      .toUpperCase(),
    body("modified_place_of_birth")
      .notEmpty()
      .withMessage("Place of birth: Required")
      .trim()
      .customSanitizer((value) =>
        replaceMultipleWhitespaceWithSingleWhiteSpace(value)
      )
      .isAlpha("en-US", { ignore: " ," })
      .withMessage("Place of birth: Letters only")
      .toUpperCase(),
    body("modified_place_of_issue")
      .notEmpty()
      .withMessage("Place of issue: Required")
      .trim()
      .customSanitizer((value) =>
        replaceMultipleWhitespaceWithSingleWhiteSpace(value)
      )
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Place of issue: Letters only")
      .toUpperCase(),
    body("modified_date_of_issue")
      .notEmpty()
      .withMessage("Date of issue: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isDate()
      .withMessage("Date of issue: Invalid date")
      .isBefore(getDate())
      .withMessage("Date of issue: Must be before today"),
    body("modified_date_of_expiry")
      .notEmpty()
      .withMessage("Date of expiry: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isDate()
      .withMessage("Date of expiry: Invalid date")
      .isAfter(PASSPORT_EXPIRY_DATE_EXCEPT_AFTER)
      .withMessage("Date of expiry: Must be after 28th Feb, 2025"),
  ];
};

const aadhaarDataValidationRules = () => {
  return [
    param("application_id")
      .isInt()
      .withMessage("Application ID: Must be a number"),
    body("modified_aadhaar_number")
      .notEmpty()
      .withMessage("Aadhaar number: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isInt()
      .withMessage("Aadhaar number: Must be number")
      .isLength({ min: 12, max: 12 })
      .withMessage("Aadhaar number: Must be 12 digits long")
      .customSanitizer((value) => aadhaarNumberFormat(value)),
  ];
};

const panDataValidationRules = () => {
  return [
    param("application_id")
      .isInt()
      .withMessage("Application ID: Must be a number"),
    body("modified_pan_number")
      .notEmpty()
      .withMessage("PAN number: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isAlphanumeric()
      .withMessage("PAN number: Letters and numbers only")
      .isLength({ min: 10, max: 10 })
      .withMessage("PAN number: Must be 10 characters long")
      .toUpperCase(),
  ];
};

const vaccineDataValidationRules = () => {
  return [
    param("application_id")
      .isInt()
      .withMessage("Application ID: Must be a number"),
    body("vaccine_type")
      .toUpperCase()
      .notEmpty()
      .withMessage("Vaccine type: Required")
      .isIn(VACCINE_TYPES)
      .withMessage(`Vaccine type: Choose one from drop-down`),
    body("last_vaccination_date")
      .customSanitizer((value, { req }) => {
        if (req.body.vaccine_type === "NONE") {
          return null;
        } else {
          return value;
        }
      })
      .if(body("vaccine_type").not().equals("NONE"))
      .notEmpty()
      .withMessage("Date of vaccine: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isDate()
      .withMessage("Date of vaccine: Invalid date")
      .isBefore(getDate())
      .withMessage("Date of vaccine: Must be before today"),
    body("vaccination_certificate_no")
      .customSanitizer((value, { req }) => {
        if (req.body.vaccine_type === "NONE") {
          return null;
        } else {
          return value;
        }
      })
      .if(body("vaccine_type").not().equals("NONE"))
      .notEmpty()
      .withMessage("Vaccination certificate number: Required")
      .trim()
      .customSanitizer((value) => removeWhitespaceOfAString(value))
      .isInt()
      .withMessage("Vaccination certificate number: Numbers only")
      .isLength({ min: 11, max: 11 })
      .withMessage("Vaccination certificate number: Must be 11 digits long"),
  ];
};

const otherDataValidationRules = () => {
  return [
    param("application_id")
      .isInt()
      .withMessage("Application ID: Must be a number"),
    body("division_name")
      .notEmpty()
      .withMessage("Division name: Required")
      .custom(async (value) => {
        const result = await fetch(
          `http://localhost:4000/divisions?division_name=${value}`
        );
        const existingData = await result.json();
        if (existingData.length == 0) {
          throw new Error("Division name: Choose one from drop-down");
        }
      }),
    body("meal_preferences")
      .toUpperCase()
      .notEmpty()
      .withMessage("Meal preferences: Required")
      .isIn(MEAL_TYPES)
      .withMessage(`Meal preferences: Choose one from drop-down`),
    body("place_of_work")
      .trim()
      .notEmpty()
      .withMessage("Place of work: Required")
      .customSanitizer((value) =>
        replaceMultipleWhitespaceWithSingleWhiteSpace(value)
      )
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Place of work: Letters only")
      .toUpperCase(),
    body("state_name")
      .notEmpty()
      .withMessage("State name: Required")
      .custom(async (value) => {
        const result = await fetch(
          `http://localhost:4000/states?state_name=${value}`
        );
        const existingData = await result.json();
        if (existingData.length == 0) {
          throw new Error("State name: Choose one from drop-down");
        }
      }),
  ];
};

const singleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    console.log(result);
    return next(createError(400, result.errors[0].msg));
  }
  next();
};
//////////////////////////////////////////////////

/* GET Hello Express */
router.get("/", function (req, res, next) {
  res.send("Hello Express");
});

router.put(
  "/applications/:application_id/passport",
  passportDataValidationRules(),
  singleValidation,
  async (req, res, next) => {
    res.send(req.body);
  }
);

router.put(
  "/applications/:application_id/aadhaar",
  aadhaarDataValidationRules(),
  singleValidation,
  async (req, res, next) => {
    res.send(req.body);
  }
);

router.put(
  "/applications/:application_id/pan",
  panDataValidationRules(),
  singleValidation,
  async (req, res, next) => {
    res.send(req.body);
  }
);

router.put(
  "/applications/:application_id/vaccine",
  vaccineDataValidationRules(),
  singleValidation,
  async (req, res, next) => {
    res.send(req.body);
  }
);

router.put(
  "/applications/:application_id/other",
  otherDataValidationRules(),
  singleValidation,
  async (req, res, next) => {
    res.send(req.body);
  }
);

module.exports = router;
