import { Request, Response } from 'express';
import { User } from '../models';
import { IUser } from '../models/user';
import bcryptjs from 'bcryptjs';
import { generateJWT, googleVerify } from '../helpers';

export const login = async (req: Request, res: Response) => {

	const { email, password } = req.body;

	try {
		
		// Verificar si el email existe
		const user: IUser | null = await User.findOne({ email });

		if( !user ) {
			return res.status(404).json({
				message: 'Usuario / Password no son correctos'
			});
		}

		// Verificar si el usuario esta activo
		if( !user.status ) {
			return res.status(404).json({
				message: 'Usuario / Password no son correctos - estado false'
			});
		}

		// Verificar si la contraseña es correcta
		const validPassword = bcryptjs.compareSync(password, user.password);

		if( !validPassword ) {
			return res.status(404).json({
				message: 'Usuario / Password no son correctos - Contraseña incorrecta'
			});
		}

		// Crear JWT
		const token = await generateJWT( user.id );
		res.json({
			user,
			token
		});

	} catch (error) {
		console.log(error);		
		return res.status(500).json({
			ok: false,
			message: 'Hable con el administrador',
			error
		});
	}
};

export const googleSignIn = async (req: Request, res: Response) => {
	
	const { id_token } = req.body;

	try {
		const { name, img, email } = await googleVerify( id_token );
		
		let user = await User.findOne({ email });

		if( !user ) {
			const data = {
				name,
				email,
				img,
				password: ':P',				
				google: true,
				role: 'USER_ROLE'
			};
			user = new User(data);
			await user.save();
		} else {
			user.google = true;
			user.img = img;
			await user.save();
		}
		
		// Si el usuario en DB
		if( !user.status ) {
			return res.status(401).json({
				message: 'Hable con el administrador, usuario bloqueado'
			});
		}

		// Crear JWT
		const token = await generateJWT( user.id );

		res.json({
			user,
			token
		});

	} catch (error) {
		console.log({error});
		return res.status(400).json({
			error,
			message: 'El token no es valido'
		});
	}

};

