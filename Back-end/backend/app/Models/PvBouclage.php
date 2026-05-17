<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PvBouclage extends Model
{
    use HasFactory;

    protected $table = 'pv_bouclages';
    protected $primaryKey = 'id_rapport';
    public $incrementing = false;

    protected $fillable = [
        'id_rapport',
        'date_bouclage',
        'nb_animaux_boucles',
        'marge_boucles_min',
        'marge_boucles_max',
        'responsable_bouclage',
        'id_eleveur',
    ];

    protected $casts = [
        'date_bouclage' => 'date',
        'marge_boucles_min' => 'integer',
        'marge_boucles_max' => 'integer',
    ];

    public function pvInscription(): BelongsTo
    {
        return $this->belongsTo(PvInscription::class, 'id_rapport', 'id_rapport');
    }

    public function eleveur(): BelongsTo
    {
        return $this->belongsTo(Eleveur::class, 'id_eleveur', 'id_eleveur');
    }
}
