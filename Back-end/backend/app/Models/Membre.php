<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Membre extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_membre';

    protected $fillable = [
        'nom',
        'prenom',
        'role',
    ];

    public function comites(): BelongsToMany
    {
        return $this->belongsToMany(Comite::class, 'comite_membre', 'id_membre', 'id_comite')
            ->withTimestamps();
    }
}
