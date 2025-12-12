CREATE DATABASE IF NOT EXISTS muebles_hermanos;
USE muebles_hermanos;

CREATE TABLE IF NOT EXISTS mueble (
    id_Mueble INT PRIMARY KEY AUTO_INCREMENT,
    nombre_mueble VARCHAR(100),
    tipo VARCHAR(50),
    precio_base INT ,
    stock INT  DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    tamano ENUM('Pequeno', 'Mediano', 'Grande'),
    material ENUM('Madera', 'Metal', 'Plastico', 'Vidrio') 
) ;

CREATE TABLE IF NOT EXISTS cotizacion (
    id_Cotizacion INT PRIMARY KEY AUTO_INCREMENT,
    fecha_cotizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    total int DEFAULT 0
) ;

CREATE TABLE IF NOT EXISTS venta (
    id_Venta INT PRIMARY KEY AUTO_INCREMENT,
    id_Cotizacion INT NOT NULL,
    fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_venta int NOT NULL,
    CONSTRAINT fk_venta_cotizacion 
        FOREIGN KEY (id_Cotizacion) 
        REFERENCES cotizacion(id_Cotizacion) 
        ON DELETE RESTRICT
) ; 

CREATE TABLE IF NOT EXISTS variante (
    id_Variante INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255),
    precio_adicional INT NOT NULL DEFAULT 0
) ;

CREATE TABLE IF NOT EXISTS cot_mueble (
    id_Cot_Mueble INT PRIMARY KEY AUTO_INCREMENT,
    id_Cotizacion INT,
    id_Mueble INT NOT NULL,
    id_Variante INT,
    cantidad INT DEFAULT 1,
    precio_unitario INT,
    CONSTRAINT fk_cotmueble_cotizacion 
        FOREIGN KEY (id_Cotizacion) 
        REFERENCES cotizacion(id_Cotizacion) ,
    CONSTRAINT fk_cotmueble_mueble 
        FOREIGN KEY (id_Mueble) 
        REFERENCES mueble(id_Mueble) ,
    CONSTRAINT fk_variante_cotizacion 
        FOREIGN KEY (id_Variante) 
        REFERENCES variante(id_Variante) 
) ;









