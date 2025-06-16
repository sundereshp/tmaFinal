import Swal from 'sweetalert2';
const CustomToast = (msg = '', type = 'success') => {
  const toast: any = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      customClass: { container: 'toast' },
  });
  toast.fire({
      icon: type,
      title: msg,
      padding: '10px 20px',
  });
};

export default CustomToast;