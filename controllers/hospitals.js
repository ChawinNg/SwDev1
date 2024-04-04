const Hospital = require("../models/Hospital");
const { param } = require("../routes/auth");
const vacCenter = require("../models/VacCenter");
//@desc     Get all hospitals
//@route    GET /api/v1/hospitals
//@access   Public

exports.getVacCenters = (req, res, next) => {
  vacCenter.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: "Some error occured while retriving Vaccine Centers",
      });
    else res.send(data);
  });
};

exports.getHospitals = async (req, res, next) => {
  let query;

  //Copy req.puery
  const reqQuery = { ...req.query };

  //Fileds to exclude
  const removeField = ["select", "sort", "page", "limit"];

  //Loop over remove fileds and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  //Create Query String
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

  //Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.select(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  try {
    const total = await Hospital.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //Execute query
    const hospitals = await query;

    //Pagination
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res
      .status(200)
      .json({ success: true, count: hospitals.length, data: hospitals });
  } catch {
    res.status(400).json({ success: false });
  }

  try {
    const hospitals = await query;
    res
      .status(200)
      .json({ success: true, count: hospitals.length, data: hospitals });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single hospitals
//@route    GET /api/v1/hospitals/:id
//@access   Public

exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create hospitals
//@route    POST /api/v1/hospitals
//@access   Private

exports.createHospital = async (req, res, next) => {
  const hospital = await Hospital.create(req.body);

  res.status(201).json({ success: true, data: hospital });
};

//@desc     Update single hospitals
//@route    PUT /api/v1/hospitals/:id
//@access   Private

exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single hospitals
//@route    DELETE /api/v1/hospitals/:id
//@access   Private

exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({ success: false });
    }

    hospital.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};