var express = require('express');
var router = express.Router();
var passport=require('./passport')

module.exports=(app)=>{
	app.all('/', (req, res, next)=>{
		res.status(200).json({success:true, 
			data:{
				name:app.get('name'),
				version:app.get('version')
			} 
		})
	})

	clientControllers(app)

	// catch 404 and forward to error handler
	app.use((req, res, next)=>{
		res.status(404).json({ success:false, error:{code:'404',message:'function not found'}})
	})

	app.use((err,req, res, next)=>{
		var error={code:'403',message:''}
		if(typeof err=='string'){
			error.message=err
		}else{
			error.code=err.code || err.name || 'ERROR'
			if(err.message)
				error.message=err.message
			else
				error.message=err.name || ''
		}
		res.status(403).json({ success:false, error:error})
	})
}

function clientControllers(app){
	
	app.all('/:service/:dbId/*', (req, res, next)=>{
		if(repoDb[req.params.dbId]==undefined){
			next(`dbId:'${req.params.dbId}' bulunamadi`)
		}else{
			next()
		}
	})

	app.all('/:service/:dbId/:func', (req, res, next)=>{
		setRepoAPIFunctions(req,res,next)
	})
	app.all('/:service/:dbId/:func/:param1', (req, res, next)=>{
		setRepoAPIFunctions(req,res,next)
	})
	app.all('/:service/:dbId/:func/:param1/:param2', (req, res, next)=>{
		setRepoAPIFunctions(req,res,next)
	})

	app.all('/:service/:dbId/:func/:param1/:param2/:param3', (req, res, next)=>{
		setRepoAPIFunctions(req,res,next)
	})

	function setRepoAPIFunctions(req,res,next){
		passport(req,res,next,(member)=>{
			var serviceName=''
			switch(req.params.service.toLowerCase()){
				case 'edespatch':
				case 'despatch':
				case 'e-despatch':
					serviceName='eDespatch'
				break
				case 'einvoice':
				case 'invoice':
				case 'e-invoice':
					serviceName='eInvoice'
				break
				default:
					throw {code:'Error',message:`'${req.params.service} service was not found`}
				break
			}
			var ctl=getController(req.params.func)
			ctl(repoDb[req.params.dbId], req, res, next, (data)=>{
				if(data==undefined)
					res.json({success:true})
				else if(data==null)
                    res.json({success:true})
                 else if(data.file!=undefined)
                    downloadFile(data.file,req,res,next)
                else if(data.fileId!=undefined)
                    downloadFileId(repoDb[req.params.dbId],data.fileId,req,res,next)
                else if(data.sendFile!=undefined)
                    sendFile(data.sendFile,req,res,next)
                else if(data.sendFileId!=undefined)
                    sendFileId(repoDb[req.params.dbId],data.sendFileId,req,res,next)
                else{
					res.status(200).json({ success:true, data: data })
				}
			})
		})
	}

	function getController(serviceName,funcName){
		var controllerName=path.join(__dirname,'../${serviceName}/controllers',`${funcName}.controller.js`)
		if(fs.existsSync(controllerName)==false){
			throw {code:'Error',message:`'${serviceName}/${funcName}' controller function was not found`}
		}else{
			
			return require(controllerName)
		}
	}
}

function sendError(err,res){
	var error={code:'403',message:''}
	if(typeof err=='string'){
		error.message=err
	}else{
		error.code=err.code || err.name || 'ERROR'
		if(err.message)
			error.message=err.message
		else
			error.message=err.name || ''
	}
	res.status(403).json({ success:false, error:error})
}

global.error={
	param1:function(req, next){
		next({code:'WRONG_PARAMETER', message:`function:[/${req.params.func}] [/:param1] is required`})
		// next({code:'WRONG_PARAMETER', message:`[/:param1] is required`})
	},
	param2:function(req, next){
		next({code:'WRONG_PARAMETER', message:`function:[/${req.params.func}/${req.params.param1}] [/:param2] is required`})
		// next({code:'WRONG_PARAMETER', message:`/param1 [/:param2] is required`})
	},
	method:function(req, next){
		next({code:'WRONG_METHOD', message:`function:${req.params.func} WRONG METHOD: ${req.method}`})
	}
}
