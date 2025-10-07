const BASE_URL = process.env.NEXT_PUBLIC_BASE_USER;

export async function addUser(token) {
    const userData = { pin: token, idNo: token };

    try {
        let response = await fetch(`${BASE_URL}/addUser.php`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        let result = await response.text();
        console.log("Respuesta de addUser:", result);
    } catch (error) {
        console.error("Error al agregar usuario:", error);
    }
}

// Función para asignar niveles de acceso al usuario
export async function addUserAccessLevel(token) {
    const accessData = { pin: token };

    try {
        let response = await fetch(`${BASE_URL}/addLevelUser2.php`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(accessData),
        });

        let result = await response.text();
        console.log("Respuesta de addLevelUser2:", result);
    } catch (error) {
        console.error("Error al asignar niveles de acceso:", error);
    }
}

export async function createUser(token) {
    try {
        console.log('Creando usuario en sistema de torniquete:', token);

        // Primero crear el usuario
        await addUser(token);

        // Luego asignar niveles de acceso
        await addUserAccessLevel(token);

        return true;
    } catch (error) {
        console.error('Error al crear usuario en sistema de torniquete:', error);
        throw new Error('No se pudo crear el acceso en el sistema del torniquete');
    }
};