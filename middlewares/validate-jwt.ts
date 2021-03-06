import { Response, NextFunction, } from 'express';
import jwt from 'jsonwebtoken';

import { IUser, User } from '../models'; 
import { UserRequest } from '../interfaces';

export const validateJWT = async (req: UserRequest, res: Response, next: NextFunction) => {
	const token = req.header('x-token');

	if( !token ) {
		return res.status(401).json({
			message: 'No hay token en la petición'
		});         
	}

	try {
		// Obtener id del token
		const { uid } = <{ uid: string }>jwt.verify(token, process.env.SECRET_OR_PRIVATE_KEY || '');
      
		const user: IUser | null = await User.findById( uid );

		if( !user ) {
			return res.status(404).json({
				message: 'Usuario no encontrado'
			});
		}

		// Verificar si el uid tiene estado en true
		if( user && !user.status ) {
			return res.status(401).json({
				message: 'El usuario no está activo'
			});
		}

		// Add user to request
		req.headers.user = user;

		next();
	} catch (error) {
		console.log({error});      
		res.status(401).json({
			message: 'Token no válido'
		});
	}

};