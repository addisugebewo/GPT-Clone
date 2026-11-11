const errorHandler = (err, req, res, next) => {
  console.log( 'erroor in request:' ,err.message);

  return res.status(err.status || 500).json({
    status: false,

    message: err.message ||"Internal Server Error",
  });
};

export default errorHandler;
