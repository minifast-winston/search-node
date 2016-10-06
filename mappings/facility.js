const FacilityMapping = {
  properties: {
    loc: {
      type: 'geo_point',
      fielddata: {
        format: 'compressed',
        precision: '1km'
      }
    }
  }
};

exports.Mapping = FacilityMapping;
