import express, { Application } from 'express';  
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { auth, categories, products, users, search, uploads } from '../routes';
import { dbConnection } from '../database/config';

class Server { 	

	app : Application;
	port: string;
	paths: { 
		auth: string,
		categories: string
		users: string
		products: string
		search: string
		uploads: string
	};

	constructor(){      
		this.app = express();
		this.port = this.port =  process.env.PORT || '8000';
		this.paths = {
			users: '/api/users',
			auth: '/api/auth',
			categories: '/api/categories',
			products: '/api/products',
			search: '/api/search',
			uploads: '/api/uploads'
		};

		// Conectar a la base de datos
		this.connectDB();
		
		// Middlewares
		this.middlewares();

		// Rutas de mi aplicación
		this.routes();
	}

	async connectDB(){
		await dbConnection();		
	}

	middlewares() {

		// CORS 
		this.app.use( cors() );

		// Body Parser 
		this.app.use( express.json() );

		// Directorio publico
		this.app.use( express.static('public') );

		// Carga de archivos
		this.app.use(fileUpload({
			useTempFiles : true,
			tempFileDir : '/tmp/'
		}));

	}

	routes() { 
		this.app.use(this.paths.auth, auth );
		this.app.use(this.paths.categories, categories );
		this.app.use(this.paths.products, products );
		this.app.use(this.paths.search, search );
		this.app.use(this.paths.users, users );
		this.app.use(this.paths.uploads, uploads );
	}

	listen() {       
		this.app.listen(this.port, () => {
			console.log('Example app listening on port', this.port);
		});
	}

}

export default Server;