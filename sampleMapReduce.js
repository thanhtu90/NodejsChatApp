var giohang = [
    {
        "don_gia" : 10000,
        "so_luong": 2
    },
    {
        "don_gia" : 5000,
        "so_luong": 3
    },
];

// Tinh thanh tien cua moi san pham

var gio_hang_moi = giohang.map(function(sanpham){
    sanpham.thanh_tien = sanpham.don_gia * sanpham.so_luong
    return sanpham
})

console.log(gio_hang_moi)

var lop_12a1 = [
    {
        "ten" : "Tu",
        "diem_trung_binh" : 10
    },
    {
        "ten" : "Teo",
        "diem_trung_binh" : 5
    }
]

var lop_12a1_moi = lop_12a1.map(function(hocsinh){
    if (hocsinh.diem_trung_binh > 8){
        hocsinh.hoc_luc = "gioi"
    }else{
        hocsinh.hoc_luc = "kem"
    }
    return hocsinh
})

console.log(lop_12a1_moi)

var giohang = [
    {
        "don_gia" : 10000,
        "so_luong": 2
    },
    {
        "don_gia" : 5000,
        "so_luong": 3
    },
];

var thanh_tien = giohang.reduce(function(tongtien, mon_hang){
    tongtien = mon_hang.don_gia * mon_hang.so_luong
    return tongtien
},0)

thanh_tien