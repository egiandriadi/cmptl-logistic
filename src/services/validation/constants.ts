export const CodType = {
  COD : "COD",
  NON_COD : "NON COD"
}

export const ErrorMessages = {
  TANGGAL_ORDER : {
    REQUIRED: "Tanggal order harus terisi",
    INVALID: "Input tanggal order tidak sesuai",
    MIN_DATE: "Tanggal order minimal adalah hari ini"
  },
  PELANGGAN_HP : {
    REQUIRED: "Nomor pelanggan harus terisi",
    INVALID: "Nomor pelanggan harus sesuai",
    MAX : "Nomor pelanggan maksimal 50 karakter",
    IS_DIGIT: "Input nomor pelanggan harus berupa angka"
  },
  PELANGGAN_NAMA : {
    REQUIRED: "Nama pelanggan harus terisi",
    INVALID: "Input nama pelanggan tidak sesuai",
    MAX : "Nama pelanggan maksimal 30 karakter"
  },
  PELANGGAN_ALAMAT : {
    REQUIRED: "Alamat pelanggan harus terisi",
    INVALID: "Input alamat pelanggan tidak sesuai",
    MAX : "Alamat pelanggan maksimal 85 karakter"
  },
  PELANGGAN_WILAYAH : {
    REQUIRED: "Wilayah pelanggan harus terisi",
    INVALID: "Input wilayah pelanggan tidak sesuai",
  },
  PELANGGAN_KOTA : {
    REQUIRED: "Kota pelanggan harus terisi",
    INVALID: "Input kota pelanggan tidak sesuai",
    MAX : "Kota pelanggan maksimal 20 karakter"
  },
  PELANGGAN_PROVINSI : {
    REQUIRED: "Provinsi pelanggan harus terisi",
    INVALID: "Input provinsi pelanggan tidak sesuai",
    MAX : "Provinsi pelanggan maksimal 25 karakter"
  },
  KODE_POS : {
    REQUIRED: "Kode pos harus terisi",
    INVALID: "Input kode pos tidak sesuai",
    IS_DIGIT: "Kode pos harus berupa angka"
  },
  METODE_PEMBAYARAN : {
    REQUIRED: "Metode pembayaran harus terisi",
    INVALID: "Input metode pembayaran tidak sesuai"
  },
  NILAI_COD : {
    REQUIRED: "Nilai COD harus terisi",
    IS_DIGIT: "Nilai COD harus berupa angka",
    ON_NON_COD: "Nilai COD tidak boleh diisi"
  },
  NILAI_BARANG : {
    REQUIRED: "Nilai Barang harus terisi",
    IS_DIGIT: "Nilai Barang harus berupa angka"
  },
  NAMA_PAKET : {
    REQUIRED: "Nama paket harus terisi",
    INVALID: "Input nama paket tidak sesuai",
    MAX : "Nama paket maksimal 60 karakter"
  },
  BERAT : {
    REQUIRED: "Berat paket harus terisi",
    INVALID: "Input berat paket tidak sesuai",
  },
  JUMLAH : {
    REQUIRED: "Jumlah paket harus terisi",
    INVALID: "Input jumlah paket tidak sesuai",
  },
  CATATAN_PENGIRIMAN : {
    INVALID: "Input catatan pengiriman tidak sesuai",
    MAX : "Catatan pengiriman maksimal 60 karakter"
  }
}
