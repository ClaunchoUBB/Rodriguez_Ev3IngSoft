-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 12-12-2025 a las 23:53:08
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `muebles_hermanos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `id_Cotizacion` int(11) NOT NULL,
  `fecha_cotizacion` datetime DEFAULT current_timestamp(),
  `total` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`id_Cotizacion`, `fecha_cotizacion`, `total`) VALUES
(15, '2025-12-12 04:38:15', 1100),
(21, '2025-12-12 18:14:03', 2200),
(22, '2025-12-12 18:23:13', 2200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cot_mueble`
--

CREATE TABLE `cot_mueble` (
  `id_Cot_Mueble` int(11) NOT NULL,
  `id_Cotizacion` int(11) DEFAULT NULL,
  `id_Mueble` int(11) NOT NULL,
  `id_Variante` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT 1,
  `precio_unitario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cot_mueble`
--

INSERT INTO `cot_mueble` (`id_Cot_Mueble`, `id_Cotizacion`, `id_Mueble`, `id_Variante`, `cantidad`, `precio_unitario`) VALUES
(12, NULL, 18, 18, 1, 1100),
(13, NULL, 18, 18, 1, 1100),
(18, NULL, 18, 18, 2, 1100),
(19, 22, 18, 18, 2, 1100);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mueble`
--

CREATE TABLE `mueble` (
  `id_Mueble` int(11) NOT NULL,
  `nombre_mueble` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `precio_base` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `tamano` tinyint(4) DEFAULT NULL,
  `material` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mueble`
--

INSERT INTO `mueble` (`id_Mueble`, `nombre_mueble`, `tipo`, `precio_base`, `stock`, `activo`, `tamano`, `material`) VALUES
(18, 'test', 'test', 1000, 8, 1, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variante`
--

CREATE TABLE `variante` (
  `id_Variante` int(11) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio_adicional` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `variante`
--

INSERT INTO `variante` (`id_Variante`, `descripcion`, `precio_adicional`) VALUES
(18, 'varTest', 100);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_Venta` int(11) NOT NULL,
  `id_Cotizacion` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `total_venta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_Venta`, `id_Cotizacion`, `fecha_venta`, `total_venta`) VALUES
(3, 22, '2025-12-12 21:39:47', 2200);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`id_Cotizacion`);

--
-- Indices de la tabla `cot_mueble`
--
ALTER TABLE `cot_mueble`
  ADD PRIMARY KEY (`id_Cot_Mueble`),
  ADD KEY `fk_cotmueble_cotizacion` (`id_Cotizacion`),
  ADD KEY `fk_cotmueble_mueble` (`id_Mueble`),
  ADD KEY `fk_variante_cotizacion` (`id_Variante`);

--
-- Indices de la tabla `mueble`
--
ALTER TABLE `mueble`
  ADD PRIMARY KEY (`id_Mueble`);

--
-- Indices de la tabla `variante`
--
ALTER TABLE `variante`
  ADD PRIMARY KEY (`id_Variante`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_Venta`),
  ADD KEY `fk_venta_cotizacion` (`id_Cotizacion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `id_Cotizacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `cot_mueble`
--
ALTER TABLE `cot_mueble`
  MODIFY `id_Cot_Mueble` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `mueble`
--
ALTER TABLE `mueble`
  MODIFY `id_Mueble` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `variante`
--
ALTER TABLE `variante`
  MODIFY `id_Variante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_Venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cot_mueble`
--
ALTER TABLE `cot_mueble`
  ADD CONSTRAINT `fk_cotmueble_cotizacion` FOREIGN KEY (`id_Cotizacion`) REFERENCES `cotizacion` (`id_Cotizacion`),
  ADD CONSTRAINT `fk_cotmueble_mueble` FOREIGN KEY (`id_Mueble`) REFERENCES `mueble` (`id_Mueble`),
  ADD CONSTRAINT `fk_variante_cotizacion` FOREIGN KEY (`id_Variante`) REFERENCES `variante` (`id_Variante`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `fk_venta_cotizacion` FOREIGN KEY (`id_Cotizacion`) REFERENCES `cotizacion` (`id_Cotizacion`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
