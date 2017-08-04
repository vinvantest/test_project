var helper = require('../config/helperFunctions.js');
var logger = require('../config/logger.js');
var UserModel = require('../model/UserModel.js');

//console.log('Router Module - helper and logger require complete');
//logger.log('info', 'Inside Router Module - helper, logger & UserModel require statement completed');

//fake database
var users = {};
var max_user_id = 0;

module.exports = function(server)
{

    // Get http://localhost:8888/ - do not return all values
    server.get("/", function(req, res, next)
    {
        //logger.log('debug', 'reached Get / ');
        //logger.log('debug', 'Invoking UserModel.find...');
        //UserModel.find({}, function (err, users)
        //{
            //logger.log('debug', 'Inside UserModel.find() Get / ');
            var message = 'Welcome to test project apis';
            helper.success(res,next,message);
            return next();
        //});
    });

    // GET http://localhost:8888/users with pagenation example
    server.get("/users", function(req, res, next)
    {
        //logger.log('debug', 'reached Get / ');
        //logger.log('debug', 'Invoking UserModel.find...');
        var query = {};
        var options = {
          page: 1, // pass 0 or 1 for the first page
          limit: 5,
          lean: true,
          sortBy: 'first_name',
          columns: 'career last_name first_name'
          //populate: 'first_name' //throwing castbyId error
        };

        //logger.log('info', 'calling UserModel.paginate() -->');
        UserModel.paginate(query, options, function(error, results, total, pages){
        //logger.log('info', 'Inside callback UserModel.paginate() -->');
          if(error) {
            logger.log('error', 'Error: in else UserModel.paginate() --> ' + error);
            helper.failure(res,next,error,500);
            return next();
          } else{
                //logger.log('info', '****** result.docs: are');
                logger.log('info', 'Total Result count is = ' + parseInt(results.length));

                var query_result_count = 0;
                for(var field in results){
                  //console.log('result[' + field + '] -->' + JSON.stringify(results[field]));
                  logger.log('info', 'result['+field+'] -->' + JSON.stringify(results[field]));
                }
                //Page requested is larger than total pages with the limit set then end message or error
                if(pages > 0 && parseInt(options.page) > pages) {
                  logger.log('info', 'Page=' + options.page + ' called beyond Pages='+ pages);
                  helper.failure(res,next,
                    'No records found for the page requested: '
                    + 'Page = '
                    + options.page
                    + ' called beyond Pages = '
                    + pages,404);
                  return next();
                }
                else {
                  logger.log('info', 'query_collection_total: ' + total);
                  logger.log('info', 'number_of_pages_based_on_limit ' + pages);

                    var next_page_number = parseInt(options.page) + 1;

                    if(next_page_number > pages){
                      next_page_number = -1;//reached limit. no more pages left for the next call
                    }
                    var returnObj = {
                    query_collection_result: results,
                    query_collection_total: total,
                    query_page_number_passed: options.page,
                    query_limit_passed: options.limit,
                    number_of_pages_based_on_limit: pages,
                    next_page_number_to_pass: next_page_number
                  };

                  //helper.success(res,next,results);
                  helper.success(res,next,returnObj);
                  return next();
                }
              }
        });
    });

    // GET http://localhost:8888/users/5983848f5e5b290fc49fa5fd
    // GET http://localhost:8888/users/59811995001b3d31b43d8da2?first=Dummy&second=Tummy
    server.get("/users/:id", function(req, res, next)
    {
      req.assert('id', 'Id is required and must be numeric').notEmpty();
      var errors = req.validationErrors();
      if(errors)
      {
        helper.failure(res,next,errors[0],400);
        return next();
      }

      logger.log('info', 'req.params.id = ' + JSON.stringify(req.params.id));

      //get Query params
      var queryParams = req.getQuery();
      logger.log('info', 'queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
                  + 'where first param is: ' + JSON.stringify(req.query.first)
                  + 'second param is: ' + JSON.stringify(req.query.second)
                  + 'third param is: ' + JSON.stringify(req.query.third)
                );

      //you can loop in the query object
      for(var field in req.query){
        logger.log('info', 'Field['+field+'] = '+req.query[field]);
      }//for loop end

      UserModel.findOne({ _id: req.params.id }, function (err, user)
       {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database - ' + JSON.stringify(err), 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user could not be found', 404);
  				return next();
  			}
            helper.success(res, next, user);
            return next();
		});


  });// GET ends

    // POST http://localhost:8888/users/
    server.post("/user", function(req, res, next)
    {
      req.assert('first_name', 'First name is required').notEmpty();
      req.assert('last_name', 'Last name is required').notEmpty();
      req.assert('email_address', 'Email address is required and must be a valid email').notEmpty().isEmail();
      req.assert('career', 'Career must be either student, teacher, or professor').isIn(['student','teacher','professor']);
      var errors = req.validationErrors();
      if (errors)
      {
        helper.failure(res, next, errors, 400);
        return next();
      }
      var user = new UserModel();
      user.first_name = req.params.first_name;
      user.last_name = req.params.last_name;
      user.email_address = req.params.email_address;
      user.career = req.params.career;
      user.save(function (err)
      {
        if(err)
        {
          helper.failure(res, next, 'Error saving user to DB - ' + JSON.stringify(err), 500);
          return next();
        }
        helper.success(res,next,user);
        return next();
      });
    });

    // PUT http://localhost:8888/users/5983848f5e5b290fc49fa5fd
    server.put("/users/:id", function(req, res, next)
    {
      req.assert('id', 'Id is required and must be numeric').notEmpty();
  		var errors = req.validationErrors();
  		if (errors) {
  			helper.failure(res, next, errors[0], 400);
  			return next();
  		}
      UserModel.findOne({ _id: req.params.id }, function (err, user)
      {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database', 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user could not be found', 404);
  				return next();
  			}
  			var updates = req.params;
  			delete updates.id;
  			for (var field in updates)
  			{
  				user[field] = updates[field];
  			}
  			user.save(function (err)
  			{
  				if (err)
  				 {
  					helper.failure(res, next, errors, 500);
  					return next();
                 }
              helper.success(res,next,user);
              return next();
  			});
		  });
    });

    // DELETE http://localhost:8888/users/5983848f5e5b290fc49fa5fd
    server.del("/users/:id", function(req, res, next)
    {
      req.assert('id', 'Id is required and must be numeric').notEmpty();
  		var errors = req.validationErrors();
  		if (errors)
  		{
  			helper.failure(res, next, errors[0], 400);
  			return next();
  		}
      UserModel.findOne({ _id: req.params.id }, function (err, user)
      {
  			if (err)
  			{
  				helper.failure(res, next, 'Something went wrong while fetching the user from the database', 500);
  				return next();
  			}
  			if (user === null)
  			{
  				helper.failure(res, next, 'The specified user could not be found', 404);
  				return next();
  			}
  			user.remove(function (err)
  			{
  				if (err)
  				{
  					helper.failure(res, next, errors, 500);
  					return next();
  				}
  				helper.success(res, next, user);
  				return next();
  			});
  		});
    });

}//router.js module.exports end
